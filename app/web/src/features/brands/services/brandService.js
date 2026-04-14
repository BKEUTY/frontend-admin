import BaseApi from '@/services/BaseApi';

class BrandService extends BaseApi {
    constructor() {
        super('/api/admin/brand');
    }

    getAll(params = {}, config = {}) {
        return super.getAll({ size: 30, ...params }, config);
    }
}

export default new BrandService();
