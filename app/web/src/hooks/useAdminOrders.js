import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminOrderApi from '../api/adminOrderApi';
import { notification } from 'antd';
import { useLanguage } from '../i18n/LanguageContext';

export const useAdminOrders = (params = {}, options = {}) => {
    const ordersQuery = useQuery({
        queryKey: ['adminOrders', params],
        queryFn: async () => {
            const response = await adminOrderApi.getAll(params);
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

export const useAdminOrderDetail = (id, options = {}) => {
    return useQuery({
        queryKey: ['adminOrderDetail', id],
        queryFn: async () => {
            const response = await adminOrderApi.getById(id);
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
        mutationFn: ({ id, status }) => adminOrderApi.updateOrderStatus(id, status),
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
