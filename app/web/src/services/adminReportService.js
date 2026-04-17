import { axiosClient } from './axiosClient';

class AdminReportService {
    getReportData(type, params = {}, config = {}) {
        return axiosClient.get('/api/admin/dashboard/data', { 
            params: { ...params, type }, 
            ...config 
        });
    }
}

export default new AdminReportService();
