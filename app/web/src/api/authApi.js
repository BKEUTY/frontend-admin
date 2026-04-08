import axiosClient from "./axiosClient";

const authApi = {
    login: (data) => {
        return axiosClient.post('/api/auth/login', { ...data, clientType: 'ADMIN' });
    },
    refresh: () => {
        return axiosClient.post('/api/auth/refresh', {}, { skipGlobalErrorHandler: true });
    },
    logout: () => {
        return axiosClient.post('/api/auth/logout');
    }
};

export default authApi;
