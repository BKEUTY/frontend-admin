import axios from 'axios';
import queryString from 'query-string';
import { getTranslation } from '../i18n/translate';
import { notifyError } from '../utils/NotificationService';

const SERVER_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const publicAxiosClient = axios.create({
    baseURL: SERVER_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    paramsSerializer: params => queryString.stringify(params),
});

publicAxiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const { config: originalRequest, response } = error;
        const status = response ? response.status : null;

        if (!originalRequest?.skipGlobalErrorHandler) {
            let fallbackKey = 'error_unknown';
            if (status === 403) fallbackKey = 'error_403';
            else if (status === 404) fallbackKey = 'error_404';
            else if (status >= 500) fallbackKey = 'error_500';

            const errorData = response?.data;
            const apiMessage = typeof errorData === 'string' ? errorData : (errorData?.message || errorData?.error || '');
            
            let description = apiMessage || getTranslation(fallbackKey);
            
            if (error.message === 'Network Error') {
                description = getTranslation('api_error_network');
            }

            notifyError(originalRequest?.errorMessage || 'error', description);
            error.isGlobalHandled = true;
        }
        return Promise.reject(error);
    }
);

export default publicAxiosClient;
