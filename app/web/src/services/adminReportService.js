import { axiosClient } from './axiosClient';

class AdminReportService {
    getReportData(params = {}, config = {}) {
        const { params: configParams, ...restConfig } = config;
        return axiosClient.get('/api/admin/reports/data', {
            params: { ...configParams, ...params },
            ...restConfig
        });
    }
}

export default new AdminReportService();
