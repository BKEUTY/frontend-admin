import { axiosClient } from './axiosClient';

class AdminDashboardService {
    getDashboardOverview(params = {}, config = {}) {
        return axiosClient.get('/api/admin/dashboard', { params, ...config });
    }

    getDetailedOrders(params = {}, config = {}) {
        return axiosClient.get('/api/admin/dashboard/details/orders', { params, ...config });
    }

    getDetailedProducts(params = {}, config = {}) {
        return axiosClient.get('/api/admin/dashboard/details/products', { params, ...config });
    }

    getDetailedCustomers(params = {}, config = {}) {
        return axiosClient.get('/api/admin/dashboard/details/customers', { params, ...config });
    }
}

export default new AdminDashboardService();
