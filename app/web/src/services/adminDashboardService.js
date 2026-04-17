import { axiosClient } from './axiosClient';

class AdminDashboardService {
    getDashboardOverview(params = {}, config = {}) {
        const { params: configParams, ...restConfig } = config;
        return axiosClient.get('/api/admin/dashboard', { 
            params: { ...configParams, ...params }, 
            ...restConfig 
        });
    }

    getDetailedOrders(params = {}, config = {}) {
        const { params: configParams, ...restConfig } = config;
        return axiosClient.get('/api/admin/dashboard/details/orders', { 
            params: { ...configParams, ...params }, 
            ...restConfig 
        });
    }

    getDetailedProducts(params = {}, config = {}) {
        const { params: configParams, ...restConfig } = config;
        return axiosClient.get('/api/admin/dashboard/details/products', { 
            params: { ...configParams, ...params }, 
            ...restConfig 
        });
    }

    getDetailedCustomers(params = {}, config = {}) {
        const { params: configParams, ...restConfig } = config;
        return axiosClient.get('/api/admin/dashboard/details/customers', { 
            params: { ...configParams, ...params }, 
            ...restConfig 
        });
    }

    getDetailedNewUsers(params = {}, config = {}) {
        const { params: configParams, ...restConfig } = config;
        return axiosClient.get('/api/admin/dashboard/details/new-customers', { 
            params: { ...configParams, ...params }, 
            ...restConfig 
        });
    }
}

export default new AdminDashboardService();
