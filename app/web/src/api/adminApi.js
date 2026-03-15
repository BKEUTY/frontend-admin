import BaseApi from './BaseApi';
import { adminAxiosClient } from './axiosClient';

class AdminApi extends BaseApi {
    constructor() {
        super('/api/admin', adminAxiosClient);
    }

    async getStats() {
        try {
            const config = { skipGlobalErrorHandler: true };
            const [productsRes, usersRes, ordersRes] = await Promise.all([
                this.client.get(`${this.resource}/product`, { ...config, params: { size: 1 } }).catch(() => ({ data: { totalElements: 0 } })),
                this.client.get(`${this.resource}/user`, { ...config, params: { size: 1 } }).catch(() => ({ data: { totalElements: 0 } })),
                this.client.get(`${this.resource}/order`, { ...config, params: { size: 1 } }).catch(() => ({ data: { totalElements: 0 } }))
            ]);

            return {
                products: productsRes.data?.totalElements || 0,
                users: usersRes.data?.totalElements || 0,
                orders: ordersRes.data?.totalElements || 0,
                revenue: 0 
            };
        } catch (error) {
            return { products: 0, users: 0, orders: 0, revenue: 0 };
        }
    }
    
    getAllProducts(page = 0, size = 10, config = {}) {
        return this.client.get(`${this.resource}/product`, { 
            ...config, 
            params: { page, size }
        });
    }

    createProduct(data, config = {}) {
        return this.client.post(`${this.resource}/product`, data, config);
    }

    updateProduct(data, config = {}) {
        return this.client.put(`${this.resource}/product`, data, config);
    }

    createOption(data, config = {}) {
        return this.client.post(`${this.resource}/product/options`, data, config);
    }

    getVariants(productId, config = {}) {
        return this.client.get(`${this.resource}/product/${productId}/variants`, config);
    }

    updateVariant(data, config = {}) {
        return this.client.put(`${this.resource}/product/variants`, data, config);
    }

    uploadProductImage(file, productId, config = {}) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('productId', productId || 'temp');
        return this.client.post('/api/files/upload/product', formData, {
            ...config,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }

    uploadSkuImage(file, skuId, config = {}) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('skuId', skuId || 'temp');
        return this.client.post('/api/files/upload/sku', formData, {
            ...config,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
    
    getAllCategories(config = {}) {
        return this.client.get(`${this.resource}/category`, config);
    }

    createCategory(data, config = {}) {
        return this.client.post(`${this.resource}/category`, data, config);
    }

    updateCategory(id, data, config = {}) {
        return this.client.put(`${this.resource}/category/${id}`, data, config);
    }

    deleteCategory(id, config = {}) {
        return this.client.delete(`${this.resource}/category/${id}`, config);
    }

    getAllUsers(config = {}) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ data: { content: [] } }), 500);
        });
    }

    getAllOrders(config = {}) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ data: { content: [] } }), 500);
        });
    }
}

const adminApi = new AdminApi();
export default adminApi;