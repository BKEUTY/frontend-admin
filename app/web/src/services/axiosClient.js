import axios from 'axios';
import queryString from 'query-string';
import { getTranslation } from '@/utils/translate';
import { notifyError } from '@/services/NotificationService';
import { getAccessToken, setAccessToken, clearAccessToken, clearUserSession } from './tokenStorage';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const authClient = axios.create({
    baseURL: SERVER_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'ADMIN'
    }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const forceLogout = () => {
    clearAccessToken();
    clearUserSession();
    if (!window.location.pathname.includes('/login')) {
        notifyError('error', getTranslation('error_session_expired') || 'Session Expired');
        setTimeout(() => window.location.href = '/login', 1500);
    }
};

const createAxiosClient = () => {
    const client = axios.create({
        baseURL: SERVER_URL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'X-Client-Type': 'ADMIN'
        },
        paramsSerializer: params => queryString.stringify(params),
    });

    client.interceptors.request.use(
        (config) => {
            const token = getAccessToken();
            if (token && !config.url?.includes('/api/auth/')) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            const status = error.response?.status;

            if (status === 401 && !originalRequest._retry) {
                if (originalRequest.url.includes('/api/auth/refresh')) {
                    forceLogout();
                    return Promise.reject(error);
                }

                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return client(originalRequest);
                    }).catch(err => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const res = await authClient.post('/api/auth/refresh');
                    const newAccessToken = res.data.accessToken || res.data.token;

                    if (!newAccessToken) throw new Error('Token not found in response');

                    setAccessToken(newAccessToken);
                    processQueue(null, newAccessToken);

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return client(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    forceLogout();
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            if (status !== 401 && !originalRequest.skipGlobalErrorHandler) {
                let fallbackKey = 'error_unknown';
                if (status === 403) fallbackKey = 'error_403';
                else if (status === 404) fallbackKey = 'error_404';
                else if (status >= 500) fallbackKey = 'error_500';

                const errorData = error.response?.data;
                const apiMessage = typeof errorData === 'string' ? errorData : (errorData?.message || errorData?.error || '');
                const description = originalRequest.customErrorMsg || apiMessage || getTranslation(fallbackKey);

                if (error.message === 'Network Error') {
                    notifyError('error', getTranslation('api_error_network') || 'Network Error');
                } else {
                    notifyError(originalRequest.customErrorTitle || 'error', description);
                }
                error.isGlobalHandled = true;
            }

            return Promise.reject(error);
        }
    );

    return client;
};

export const axiosClient = createAxiosClient();

export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${SERVER_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};

export default axiosClient;
