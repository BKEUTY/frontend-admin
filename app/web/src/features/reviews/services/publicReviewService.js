import BaseApi from '@/services/BaseApi';
import { axiosClient } from '@/services/axiosClient';

const publicAxiosClient = axiosClient; // Current implementation uses the same client but might need public config later

class PublicReviewService extends BaseApi {
    constructor() {
        super('/api/reviews', publicAxiosClient);
    }

    getReviewsByVariantId(variantId, params) {
        return this.client.get(`${this.resource}/product/${variantId}`, { params });
    }

    getStatsByVariantId(variantId) {
        return this.client.get(`${this.resource}/product/${variantId}/stats`);
    }
}

export default new PublicReviewService();
