import { adminAxiosClient } from './axiosClient';

const resource = '/api/admin/order';

export const orderApi = {
    getAllOrders: (page = 0, size = 10, config = {}) => {
        return adminAxiosClient.get(resource, {
            ...config,
            params: { page, size }
        });
    },

    updateOrderStatus: (orderId, status, config = {}) => {
        return adminAxiosClient.put(`${resource}/${orderId}/status`, { status }, config);
    },

    getOrderById: (orderId, config = {}) => {
        return adminAxiosClient.get(`${resource}/${orderId}`, config);
    }
};
