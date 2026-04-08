import BaseApi from './BaseApi';

class AdminUserApi extends BaseApi {
    constructor() {
        super('/api/admin/user');
    }

    getUsers(config = {}) {
        return this.client.get(this.resource, config);
    }
}

const adminUserApi = new AdminUserApi();
export default adminUserApi;
