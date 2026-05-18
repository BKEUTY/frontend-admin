import BaseApi from '@/services/BaseApi';
import axiosClient from '@/services/axiosClient';

class AdminRefundService extends BaseApi {
    constructor() {
        super('/api/admin/refund-order', axiosClient);
    }

    getAllRefundOrders(params = {}, config = {}) {
        return this.client.get(this.resource, { params, ...config });
    }

    getRefundOrderById(refundOrderId, config = {}) {
        return this.client.get(`${this.resource}/${refundOrderId}`, config);
    }

    approveRefundOrder(refundOrderId, config = {}) {
        return this.client.put(`${this.resource}/${refundOrderId}/approve`, {}, config);
    }

    rejectRefundOrder(refundOrderId, config = {}) {
        return this.client.put(`${this.resource}/${refundOrderId}/reject`, {}, config);
    }

    completeRefundOrder(refundOrderId, config = {}) {
        return this.client.put(`${this.resource}/${refundOrderId}/complete`, {}, config);
    }

    processMoneyRefund(refundOrderId, config = {}) {
        return this.client.post(`${this.resource}/${refundOrderId}/process-refund`, {}, config);
    }
}

export default new AdminRefundService();
