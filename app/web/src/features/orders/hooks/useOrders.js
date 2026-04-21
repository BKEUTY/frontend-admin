import orderService from '@/features/orders/services/orderService';
import { useLanguage } from '@/store/LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { useMemo } from 'react';

export const useOrders = (params = {}, options = {}) => {
    const { t } = useLanguage();

    const queryParams = useMemo(() => {
        const cleanParams = { ...params };
        
        Object.keys(cleanParams).forEach((key) => {
            if (cleanParams[key] === null || cleanParams[key] === undefined || cleanParams[key] === '') {
                delete cleanParams[key];
            }
        });

        if (cleanParams.status === 'ALL') delete cleanParams.status;
        if (cleanParams.sort === 'default') delete cleanParams.sort;
        if (cleanParams.search) {
            cleanParams.search = String(cleanParams.search).trim();
        }
        
        return cleanParams;
    }, [params]);

    const ordersQuery = useQuery({
        queryKey: ['adminOrders', queryParams],
        queryFn: async () => {
            const response = await orderService.getAll(queryParams);
            const data = response.data || response;
            return {
                content: data?.content || [],
                totalPages: data?.totalPages || 0,
                totalElements: data?.totalElements || 0,
            };
        },
        ...options,
    });

    return {
        orders: ordersQuery.data?.content || [],
        totalPages: ordersQuery.data?.totalPages || 0,
        totalItems: ordersQuery.data?.totalElements || 0,
        isLoading: ordersQuery.isPending,
        refetchOrders: ordersQuery.refetch,
    };
};

export const useOrderDetail = (id, options = {}) => {
    return useQuery({
        queryKey: ['adminOrderDetail', id],
        queryFn: async () => {
            const response = await orderService.getById(id);
            return response.data || response;
        },
        enabled: !!id,
        ...options,
    });
};

export const useUpdateOrderStatus = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) => orderService.updateOrderStatus(id, status),
        onSuccess: () => {
            notification.success({
                key: 'update_order_status',
                message: t('success'),
                description: t('update_info_success')
            });
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
            queryClient.invalidateQueries({ queryKey: ['adminOrderDetail'] });
        },
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                notification.error({
                    key: 'update_order_status',
                    message: t('error'),
                    description: t('api_error_general')
                });
            }
        }
    });
};
