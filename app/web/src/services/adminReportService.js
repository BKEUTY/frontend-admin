import { axiosClient } from './axiosClient';

class AdminReportService {
    getReportData(type, params = {}, config = {}) {
        const { params: configParams, ...restConfig } = config;
        return axiosClient.get('/api/admin/dashboard/data', { 
            params: { ...configParams, ...params, type }, 
            ...restConfig 
        });
    }
}

export default new AdminReportService();
