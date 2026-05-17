import orderService from '@/features/orders/services/orderService';
import { useLanguage } from '@/store/LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '@/store/NotificationContext';
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
    const showNotification = useNotification();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status, paymentStatus }) => orderService.updateOrderStatus(id, status, paymentStatus),
        onSuccess: () => {
            showNotification(t('success'), 'success', t('update_info_success'));
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
            queryClient.invalidateQueries({ queryKey: ['adminOrderDetail'] });
        },
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                showNotification(t('error'), 'error', t('api_error_general'));
            }
        }
    });
};
