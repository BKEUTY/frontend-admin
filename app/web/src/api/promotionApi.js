import BaseApi from './BaseApi';

class PromotionApi extends BaseApi {
    constructor() {
        super('/api/admin/promotion');
    }
    
    // For admin to list all
    getAll(page = 0) {
        return this.client.get(this.resource, {
            params: { page, size: 30 }
        });
    }

    create(data) {
        return this.client.post(this.resource, data);
    }

    update(id, data) {
        return this.client.put(`${this.resource}/${id}`, data);
    }

    delete(id) {
        return this.client.delete(`${this.resource}/${id}`);
    }

    getById(id) {
        return this.client.get(`${this.resource}/${id}`);
    }
}

const promotionApi = new PromotionApi();
export default promotionApi;
