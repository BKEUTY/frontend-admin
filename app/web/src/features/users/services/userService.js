import BaseApi from '@/services/BaseApi';

class UserService extends BaseApi {
    constructor() {
        super('/api/admin/user');
    }

    getUsers(role, config = {}) {
        const params = role ? { role } : {};
        return this.client.get(this.resource, { params, ...config });
    }
}

export default new UserService();
