import BaseApi from '@/services/BaseApi';

class ReviewService extends BaseApi {
    constructor() {
        super('/api/admin/reviews');
    }

    replyToReview(reviewId, comment, config = {}) {
        return this.client.post(`${this.resource}/${reviewId}/reply`, { comment }, config);
    }

    updateReply(replyId, comment, config = {}) {
        return this.client.put(`${this.resource}/replies/${replyId}`, { comment }, config);
    }

    deleteReply(replyId, config = {}) {
        return this.client.delete(`${this.resource}/replies/${replyId}`, config);
    }

    delete(reviewId, config = {}) {
        return this.client.delete(`${this.resource}/${reviewId}`, config);
    }
}

export default new ReviewService();
