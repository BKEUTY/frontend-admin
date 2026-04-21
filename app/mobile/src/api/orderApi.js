import { adminAxiosClient } from './axiosClient';

const resource = '/api/admin/order';

export const orderApi = {
    getAllOrders: (page = 1, size = 10, search = '', config = {}) => {
        return adminAxiosClient.get(resource, {
            ...config,
            params: {
                page,
                size,
                search,
                ...config.params
            }
        });
    },

    updateOrderStatus: (orderId, status) => {
        return adminAxiosClient.patch(`${resource}/${orderId}/status?status=${status}`);
    },

    getOrderById: (orderId) => {
        return adminAxiosClient.get(`${resource}/${orderId}`);
    }
};
