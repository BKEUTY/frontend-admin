import axiosClient from "./axiosClient";

const authApi = {
    login: (data) => {
        const url = '/api/auth/login';
        return axiosClient.post(url, data);
    },
    refresh: (data) => {
        const url = '/api/auth/refresh';
        return axiosClient.post(url, data || {}, { skipGlobalErrorHandler: true });
    },
    logout: () => {
        const url = '/api/auth/logout';
        return axiosClient.post(url);
    }
};

export default authApi;
