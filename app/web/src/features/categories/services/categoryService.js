import BaseApi from '@/services/BaseApi';

class CategoryService extends BaseApi {
    constructor() {
        super('/api/admin/category');
    }

    getAll(params = {}, config = {}) {
        return super.getAll({ size: 30, ...params }, config);
    }
}

export default new CategoryService();
