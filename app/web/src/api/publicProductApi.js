import BaseApi from './BaseApi';
import publicAxiosClient from './publicAxiosClient';

class PublicProductApi extends BaseApi {
    constructor() {
        super('/api/product', publicAxiosClient);
    }

    getCategories() {
        return this.client.get(`${this.resource}/categories`);
    }
}

const publicProductApi = new PublicProductApi();
export default publicProductApi;
