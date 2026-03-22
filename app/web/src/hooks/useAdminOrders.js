import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import { notification } from 'antd';
import { useLanguage } from '../i18n/LanguageContext';

export const useAdminOrders = (currentPage, pageSize, isAuthenticated) => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    const { data: ordersData, isLoading: isOrdersLoading, refetch: fetchOrders } = useQuery({
        queryKey: ['adminOrders', currentPage, pageSize],
        queryFn: async () => {
            const response = await orderApi.getAllOrders(currentPage, pageSize);
            const data = response.data || response;
            return {
                content: data?.content || [],
                totalPages: data?.totalPages || 0,
                totalElements: data?.totalElements || 0,
            };
        },
        enabled: !!isAuthenticated,
        refetchOnMount: true,
        retry: false,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => orderApi.updateOrderStatus(id, status),
        onSuccess: () => {
            notification.success({ 
                key: 'update_order_status',
                message: t('success'), 
                description: t('update_info_success') 
            });
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
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

    const { data: orderDetailRes, isPending: isDetailLoading, mutateAsync: fetchOrderDetail } = useMutation({
        mutationFn: async (orderId) => {
            const response = await orderApi.getOrderById(orderId);
            return response.data || response;
        },
        onError: () => {
            notification.error({
                message: t('error'),
                description: t('api_error_fetch')
            });
        }
    });

    return {
        data: ordersData?.content || [],
        totalPages: ordersData?.totalPages || 0,
        totalItems: ordersData?.totalElements || 0,
        loading: isOrdersLoading || updateStatusMutation.isPending,
        fetchOrders,
        updateOrderStatus: updateStatusMutation.mutateAsync,
        orderDetail: orderDetailRes || null,
        detailLoading: isDetailLoading,
        fetchOrderDetail,
    };
};
