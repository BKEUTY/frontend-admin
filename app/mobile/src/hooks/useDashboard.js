import { useState, useEffect, useCallback } from 'react';
import adminApi from '../api/adminApi';

export const useDashboard = (initialRange = 'month') => {
    const [timeRange, setTimeRange] = useState(initialRange);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const now = new Date();
            let start = new Date();
            
            if (timeRange === 'week') start.setDate(now.getDate() - 7);
            else if (timeRange === 'month') start.setMonth(now.getMonth() - 1);
            else if (timeRange === 'quarter') start.setMonth(now.getMonth() - 3);
            else if (timeRange === 'year') start.setFullYear(now.getFullYear() - 1);

            const formatDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            
            const response = await adminApi.getDashboardData(formatDate(start), formatDate(now));
            setDashboardData(response.data);
        } catch (error) {
            console.error("Dashboard fetch error", error);
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        timeRange,
        setTimeRange,
        loading,
        dashboardData,
        refresh: fetchDashboardData
    };
};
