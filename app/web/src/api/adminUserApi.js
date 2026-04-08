import BaseApi from './BaseApi';

class AdminUserApi extends BaseApi {
    constructor() {
        super('/api/admin/user');
    }

    getUsers(role, config = {}) {
        const params = role ? { role } : {};
        return this.client.get(this.resource, { params, ...config });
    }
}

const adminUserApi = new AdminUserApi();
export default adminUserApi;
