import BaseApi from '@/services/BaseApi';

class ProductService extends BaseApi {
    constructor() {
        super('/api/admin/product');
    }

    getAllVariantsPaginated(page = 0, size = 10, categoryId = null, search = null, config = {}) {
        const params = { page, size };
        if (categoryId) params.categoryId = categoryId;
        if (search) params.search = search;
        return this.client.get(`${this.resource}/variants/page`, { ...config, params });
    }

    getVariants(productId, config = {}) {
        return this.client.get(`${this.resource}/${productId}/variants`, config);
    }

    createProduct(requestData, images, config = {}) {
        const formData = new FormData();
        formData.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
        if (images?.length) {
            images.forEach(file => formData.append('images', file));
        }
        return this.client.post(this.resource, formData, {
            ...config,
            headers: { 'Content-Type': 'multipart/form-data', ...config.headers }
        });
    }

    updateProduct(requestData, images, config = {}) {
        const formData = new FormData();
        formData.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
        if (images?.length) {
            images.forEach(file => formData.append('images', file));
        }
        return this.client.put(this.resource, formData, {
            ...config,
            headers: { 'Content-Type': 'multipart/form-data', ...config.headers }
        });
    }

    updateVariant(requestData, images, config = {}) {
        const formData = new FormData();
        formData.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
        if (images?.length) {
            images.forEach(file => formData.append('images', file));
        }
        return this.client.put(`${this.resource}/variants`, formData, {
            ...config,
            headers: { 'Content-Type': 'multipart/form-data', ...config.headers }
        });
    }

    deleteVariant(id, config = {}) {
        return this.client.delete(`${this.resource}/variants/${id}`, config);
    }

    createOption(data, config = {}) {
        return this.client.post(`${this.resource}/options`, data, config);
    }

    getAllOptions(config = {}) {
        return this.client.get(`${this.resource}/options`, config);
    }
}

export default new ProductService();
