import BaseApi from './BaseApi';
import { axiosClient } from './axiosClient';

class AdminApi extends BaseApi {
    constructor() {
        super('', axiosClient);
    }

    async getStats() {
        try {
            const config = { skipGlobalErrorHandler: true };
            const [productsRes, usersRes, ordersRes] = await Promise.all([
                this.client.get('/api/admin/product?size=1', config).catch(() => ({ data: { totalElements: 0 } })),
                this.client.get('/api/admin/user?size=1', config).catch(() => ({ data: { totalElements: 0 } })),
                this.client.get('/api/admin/order?size=1', config).catch(() => ({ data: { totalElements: 0 } }))
            ]);

            return {
                products: productsRes.data?.totalElements || 0,
                users: usersRes.data?.totalElements || 0,
                orders: ordersRes.data?.totalElements || 0,
                revenue: 0
            };
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
            return { products: 0, users: 0, orders: 0, revenue: 0 };
        }
    }

    getAllProducts(page = 0, size = 10, config = {}) {
        return this.client.get(`/api/admin/product?page=${page}&size=${size}`, config);
    }

    createProduct(data, config = {}) {
        return this.client.post('/api/admin/product', data, config);
    }

    updateProduct(data, config = {}) {
        return this.client.put('/api/admin/product', data, config);
    }

    createOption(data, config = {}) {
        return this.client.post('/api/admin/product/options', data, config);
    }

    getVariants(productId, config = {}) {
        return this.client.get(`/api/admin/product/${productId}/variants`, config);
    }

    updateVariant(data, config = {}) {
        return this.client.put('/api/admin/product/variants', data, config);
    }

    // For mobile, we use the same endpoints
    async uploadProductImage(fileUri, productId, config = {}) {
        const formData = new FormData();
        const filename = fileUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('file', {
            uri: fileUri,
            name: filename,
            type
        });
        formData.append('productId', productId || 'temp');

        return this.client.post('/api/files/upload/product', formData, {
            ...config,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }

    async uploadSkuImage(fileUri, skuId, config = {}) {
        const formData = new FormData();
        const filename = fileUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('file', {
            uri: fileUri,
            name: filename,
            type
        });
        formData.append('skuId', skuId || 'temp');

        return this.client.post('/api/files/upload/sku', formData, {
            ...config,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
}

const adminApi = new AdminApi();
export default adminApi;
