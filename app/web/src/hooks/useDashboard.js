import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import adminDashboardService from '@/services/adminDashboardService';

export const useDashboard = (initialTimeRange = 'month') => {
    const [timeRange, setTimeRange] = useState(initialTimeRange);

    const { data: dashboardData, isLoading: loading, error } = useQuery({
        queryKey: ['dashboardOverview', timeRange],
        queryFn: async () => {
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
            return response.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes cache
    });

    return {
        timeRange,
        setTimeRange,
        loading,
        dashboardData,
        error
    };
};
