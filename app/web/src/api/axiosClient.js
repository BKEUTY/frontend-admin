import axios from 'axios';
import queryString from 'query-string';
import { getTranslation } from '../i18n/translate';
import { notifyError } from '../utils/NotificationService';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStorage';

const SERVER_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const authBaseClient = axios.create({
    baseURL: SERVER_URL,
    withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token, error = null) => {
    refreshSubscribers.forEach((cb) => cb(token, error));
    refreshSubscribers = [];
};

const createClient = (baseURL) => {
    const client = axios.create({
        baseURL: baseURL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
        paramsSerializer: params => queryString.stringify(params),
    });

    client.interceptors.request.use((config) => {
        const currentToken = getAccessToken();
        const isAuthUrl = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'].some(url => config.url.includes(url));

        if (!isAuthUrl && currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        }
        
        if (config.data && !config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    }, (error) => Promise.reject(error));

    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const { config: originalRequest, response } = error;
            const status = response ? response.status : null;

            if (status === 401 && !originalRequest._retry) {
                if (originalRequest.url.includes('/api/auth/refresh')) {
                    return Promise.reject(error);
                }

                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        subscribeTokenRefresh((token, err) => {
                            if (err) return reject(err);
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(client(originalRequest));
                        });
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const res = await authBaseClient.post('/api/auth/refresh');
                    const newToken = res.data.accessToken || res.data.access_token || res.data.data?.accessToken;

                    if (newToken) {
                        setAccessToken(newToken);
                        onTokenRefreshed(newToken);
                        isRefreshing = false;

                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return client(originalRequest);
                    }
                } catch (refreshError) {
                    isRefreshing = false;
                    onTokenRefreshed(null, refreshError);
                    
                    clearAccessToken();
                    localStorage.removeItem('user');

                    if (!window.location.pathname.includes('/login')) {
                        const desc = getTranslation('error_session_expired') || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                        notifyError('error', desc);
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 1500);
                    }
                    return Promise.reject(refreshError);
                }
            }

            if (status !== 401 && !originalRequest.skipGlobalErrorHandler) {
                let fallbackKey = 'error_unknown';
                if (status === 403) fallbackKey = 'error_403';
                else if (status === 404) fallbackKey = 'error_404';
                else if (status >= 500) fallbackKey = 'error_500';

                const errorData = response?.data;
                let apiMessage = '';

                if (typeof errorData === 'string') apiMessage = errorData;
                else if (errorData && typeof errorData === 'object') {
                    apiMessage = errorData.message || errorData.error || '';
                }

                let description = apiMessage || error.message || getTranslation(fallbackKey);
                if (error.message === 'Network Error') {
                    description = getTranslation('api_error_network') || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra internet.';
                }

                const titleKey = originalRequest.errorMessage || 'error';
                notifyError(titleKey, description);
            }

            return Promise.reject(error);
        }
    );

    return client;
};

export const axiosClient = createClient(SERVER_URL);
export const adminAxiosClient = createClient(SERVER_URL);

export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;

    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${SERVER_URL}${path}`;
};

export default axiosClient;