import BaseApi from './BaseApi';

class AdminReviewApi extends BaseApi {
    constructor() {
        super('/api/admin/reviews');
    }

    replyToReview(reviewId, data) {
        return this.client.post(`${this.resource}/${reviewId}/reply`, data);
    }

    updateReply(replyId, data) {
        return this.client.put(`${this.resource}/replies/${replyId}`, data);
    }

    deleteReply(replyId) {
        return this.client.delete(`${this.resource}/replies/${replyId}`);
    }
}

export default new AdminReviewApi();
