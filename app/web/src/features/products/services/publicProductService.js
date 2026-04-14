import BaseApi from '@/services/BaseApi';
import { axiosClient } from '@/services/axiosClient';

class PublicProductService extends BaseApi {
    constructor() {
        super('/api/product', axiosClient);
    }

    getCategories() {
        return this.client.get(`${this.resource}/categories`);
    }
}

export default new PublicProductService();
