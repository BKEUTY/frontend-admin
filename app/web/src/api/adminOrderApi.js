import BaseApi from './BaseApi';
import axiosClient from './axiosClient';

class AdminOrderApi extends BaseApi {
    constructor() {
        super('/api/admin/order', axiosClient);
    }

    updateOrderStatus(orderId, status, config = {}) {
        return this.client.put(`${this.resource}/${orderId}/status`, { status }, config);
    }
}

const adminOrderApi = new AdminOrderApi();
export default adminOrderApi;   
