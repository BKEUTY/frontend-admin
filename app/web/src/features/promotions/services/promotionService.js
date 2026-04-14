import BaseApi from '@/services/BaseApi';

class PromotionService extends BaseApi {
    constructor() {
        super('/api/admin/promotion');
    }

    getAll(params = {}, config = {}) {
        return super.getAll({ size: 30, ...params }, config);
    }
}

export default new PromotionService();
