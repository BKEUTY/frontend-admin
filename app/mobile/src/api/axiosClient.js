import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslation } from '../i18n/translate';
import { showToast } from '../utils/ToastService';
import { 
    getAccessToken, 
    setAccessToken, 
    clearAccessToken, 
    clearUserSession,
    getRefreshToken,
    setRefreshToken,
    clearRefreshToken
} from './tokenStorage';

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

const authBaseClient = axios.create({
    baseURL: SERVER_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
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
    });

    client.interceptors.request.use(async (config) => {
        const currentToken = await getAccessToken();
        const isAuthUrl = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'].some(url => config.url?.includes(url));

        if (!isAuthUrl && currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        }
        
        return config;
    }, (error) => Promise.reject(error));

    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const { config: originalRequest, response } = error;
            const status = response ? response.status : null;

            if (status === 401 && !originalRequest._retry) {
                const currentRefreshToken = await getRefreshToken();
                const isAuthUrl = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'].some(url => originalRequest.url?.includes(url));

                if (isAuthUrl || !currentRefreshToken) {
                    if (!isAuthUrl) {
                        await clearAccessToken();
                        await clearRefreshToken();
                        await clearUserSession();
                        // Instead of window.location, show notification or navigate if possible
                        showToast(getTranslation('error'), 'error', getTranslation('error_session_expired') || 'Session expired');
                    }
                    return Promise.reject(error);
                }

                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        subscribeTokenRefresh((token, err) => {
                            if (err) return reject(err);
                            originalRequest._retry = true;
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(client(originalRequest));
                        });
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const res = await authBaseClient.post('/api/auth/refresh', { refreshToken: currentRefreshToken });
                    const newToken = res.data?.accessToken;
                    const newRefreshToken = res.data?.refreshToken;

                    if (newToken) {
                        await setAccessToken(newToken);
                        if (newRefreshToken) await setRefreshToken(newRefreshToken);
                        
                        onTokenRefreshed(newToken);
                        isRefreshing = false;
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return client(originalRequest);
                    } else {
                        throw new Error('Token missing');
                    }
                } catch (refreshError) {
                    isRefreshing = false;
                    onTokenRefreshed(null, refreshError);
                    await clearAccessToken();
                    await clearRefreshToken();
                    await clearUserSession();
                    showToast(getTranslation('error'), 'error', getTranslation('error_session_expired') || 'Session expired');
                    return Promise.reject(refreshError);
                }
            }

            if (status !== 401 && !originalRequest.skipGlobalErrorHandler) {
                let fallbackKey = 'api_error_general';
                if (status === 403) fallbackKey = 'error_403';
                else if (status === 404) fallbackKey = 'error_404';
                else if (status >= 500) fallbackKey = 'error_500';

                const errorData = response?.data;
                const apiMessage = typeof errorData === 'string' ? errorData : (errorData?.message || errorData?.details || '');
                const description = apiMessage || getTranslation(fallbackKey) || 'An error occurred';
                
                showToast(getTranslation(originalRequest.errorMessage || 'error'), 'error', description);
            }

            return Promise.reject(error);
        }
    );

    return client;
};

export const axiosClient = createClient(SERVER_URL);
export const adminAxiosClient = createClient(SERVER_URL);

export default axiosClient;
