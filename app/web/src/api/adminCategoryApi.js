import BaseApi from './BaseApi';

class AdminCategoryApi extends BaseApi {
    constructor() {
        super('/api/admin/category');
    }

    getAll(params = {}, config = {}) {
        return super.getAll({ size: 30, ...params }, config);
    }
}

const adminCategoryApi = new AdminCategoryApi();
export default adminCategoryApi;
