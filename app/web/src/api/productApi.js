import BaseApi from './BaseApi';

class ProductApi extends BaseApi {
    constructor() {
        super('/api/product');
    }
    getAll(params) {
        return this.client.get(this.resource, { params });
    }

    getCategories() {
        return this.client.get(`${this.resource}/categories`);
    }

    getById(id) {
        return this.client.get(`${this.resource}/${id}`);
    }
}

const productApi = new ProductApi();
export default productApi;

