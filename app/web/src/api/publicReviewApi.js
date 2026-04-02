import BaseApi from './BaseApi';
import publicAxiosClient from './publicAxiosClient';

class PublicReviewApi extends BaseApi {
    constructor() {
        super('/api/reviews', publicAxiosClient);
    }

    getReviewsByVariantId(variantId, params) {
        return this.client.get(`${this.resource}/product/${variantId}`, { params });
    }
}

const publicReviewApi = new PublicReviewApi();
export default publicReviewApi;
