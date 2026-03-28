import BaseApi from './BaseApi';

class AdminBrandApi extends BaseApi {
    constructor() {
        super('/api/admin/brand');
    }
}

const adminBrandApi = new AdminBrandApi();
export default adminBrandApi;
