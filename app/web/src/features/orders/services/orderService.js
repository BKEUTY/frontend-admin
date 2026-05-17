import BaseApi from '@/services/BaseApi';
import axiosClient from '@/services/axiosClient';

class OrderService extends BaseApi {
    constructor() {
        super('/api/admin/order', axiosClient);
    }

    updateOrderStatus(orderId, status, paymentStatus, config = {}) {
        const payload = {};
        if (status) payload.status = status;
        if (paymentStatus) payload.paymentStatus = paymentStatus;
        return this.client.put(`${this.resource}/${orderId}/status`, payload, config);
    }
}

export default new OrderService();
