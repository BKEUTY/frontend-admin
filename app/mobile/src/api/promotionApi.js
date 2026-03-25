import BaseApi from './BaseApi';

class PromotionApi extends BaseApi {
    constructor() {
        super('/api/admin/promotion');
    }

    getAll(params) {
        return this.client.get(this.resource, { params });
    }

    create(data) {
        return this.client.post(this.resource, data);
    }

    update(id, data) {
        return this.client.put(`${this.resource}/${id}`, data);
    }
}

const promotionApi = new PromotionApi();
export default promotionApi;
