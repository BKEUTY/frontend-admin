import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslation } from '../i18n/translate';
import { showToast } from '../utils/ToastService';

const axiosClient = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.config?.skipGlobalErrorHandler) {
            const status = error.response ? error.response.status : null;
            let fallbackKey = 'api_error_general';

            if (status === 401) fallbackKey = 'error_401';
            else if (status === 403) fallbackKey = 'error_403';
            else if (status === 404) fallbackKey = 'error_404';
            else if (status >= 500) fallbackKey = 'error_500';

            const apiMessage = error.response?.data?.message || error.response?.data?.error;
            let description = apiMessage || error.message || getTranslation(fallbackKey);

            if (error.message === 'Network Error') {
                description = getTranslation('api_error_network') || 'Network Error';
            }

            const title = getTranslation(error.config?.errorMessage || 'error');

            showToast(title, 'error', description);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
