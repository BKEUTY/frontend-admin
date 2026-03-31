import BaseApi from './BaseApi';

class AdminProductApi extends BaseApi {
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

    updateVariant(data, config = {}) {
        return this.client.put(`${this.resource}/variants`, data, config);
    }

    deleteVariant(id, config = {}) {
        return this.client.delete(`${this.resource}/variants/${id}`, config);
    }

    createOption(data, config = {}) {
        return this.client.post(`${this.resource}/options`, data, config);
    }

    uploadProductImage(file, productId, config = {}) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('productId', productId || 'temp');
        return this.client.post('/api/files/upload/product', formData, {
            ...config,
            headers: { 'Content-Type': 'multipart/form-data', ...config.headers }
        });
    }

    uploadSkuImage(file, skuId, config = {}) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('skuId', skuId || 'temp');
        return this.client.post('/api/files/upload/sku', formData, {
            ...config,
            headers: { 'Content-Type': 'multipart/form-data', ...config.headers }
        });
    }
}

const adminProductApi = new AdminProductApi();
export default adminProductApi;
