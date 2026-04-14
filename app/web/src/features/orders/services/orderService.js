import BaseApi from '@/services/BaseApi';
import axiosClient from '@/services/axiosClient';

class OrderService extends BaseApi {
    constructor() {
        super('/api/admin/order', axiosClient);
    }

    updateOrderStatus(orderId, status, config = {}) {
        return this.client.put(`${this.resource}/${orderId}/status`, { status }, config);
    }
}

export default new OrderService();
