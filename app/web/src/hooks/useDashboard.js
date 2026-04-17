import { useState, useEffect } from 'react';
import adminDashboardService from '@/services/adminDashboardService';

export const useDashboard = (initialTimeRange = 'month') => {
    const [timeRange, setTimeRange] = useState(initialTimeRange);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const end = new Date();
                const start = new Date();
                
                if (timeRange === 'week') start.setDate(end.getDate() - 7);
                else if (timeRange === 'month') start.setMonth(end.getMonth() - 1);
                else if (timeRange === 'quarter') start.setMonth(end.getMonth() - 3);
                else if (timeRange === 'year') start.setFullYear(end.getFullYear() - 1);
                
                const formatDate = (dateObj) => {
                    const y = dateObj.getFullYear();
                    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const d = String(dateObj.getDate()).padStart(2, '0');
                    return `${y}-${m}-${d}`;
                };

                const startDate = formatDate(start);
                const endDate = formatDate(end);
                
                const response = await adminDashboardService.getDashboardOverview({ startDate, endDate });
                setDashboardData(response.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [timeRange]);

    return {
        timeRange,
        setTimeRange,
        loading,
        dashboardData,
        error
    };
};
