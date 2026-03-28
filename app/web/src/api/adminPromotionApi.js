import BaseApi from './BaseApi';

class AdminPromotionApi extends BaseApi {
    constructor() {
        super('/api/admin/promotion');
    }

    getAll(page = 0) {
        return this.client.get(this.resource, {
            params: { page, size: 30 }
        });
    }
}

const adminPromotionApi = new AdminPromotionApi();
export default adminPromotionApi;
