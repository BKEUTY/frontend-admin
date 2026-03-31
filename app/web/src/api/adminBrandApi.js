import BaseApi from './BaseApi';

class AdminBrandApi extends BaseApi {
    constructor() {
        super('/api/admin/brand');
    }

    getAll(params = {}, config = {}) {
        return super.getAll({ size: 30, ...params }, config);
    }
}

const adminBrandApi = new AdminBrandApi();
export default adminBrandApi;
