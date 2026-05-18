import adminRefundService from '@/features/orders/services/adminRefundService';
import { useLanguage } from '@/store/LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '@/store/NotificationContext';
import { useMemo } from 'react';

export const useAdminRefunds = (params = {}, options = {}) => {
    const queryParams = useMemo(() => {
        const cleanParams = { ...params };
        
        Object.keys(cleanParams).forEach((key) => {
            if (cleanParams[key] === null || cleanParams[key] === undefined || cleanParams[key] === '') {
                delete cleanParams[key];
            }
        });

        if (cleanParams.status === 'ALL') delete cleanParams.status;
        
        return cleanParams;
    }, [params]);

    const refundsQuery = useQuery({
        queryKey: ['adminRefunds', queryParams],
        queryFn: async () => {
            const response = await adminRefundService.getAllRefundOrders(queryParams);
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
        refunds: refundsQuery.data?.content || [],
        totalPages: refundsQuery.data?.totalPages || 0,
        totalItems: refundsQuery.data?.totalElements || 0,
        isLoading: refundsQuery.isPending,
        refetchRefunds: refundsQuery.refetch,
    };
};

export const useAdminRefundDetail = (id, options = {}) => {
    return useQuery({
        queryKey: ['adminRefundDetail', id],
        queryFn: async () => {
            const response = await adminRefundService.getRefundOrderById(id);
            return response.data || response;
        },
        enabled: !!id,
        ...options,
    });
};

export const useUpdateRefundStatus = () => {
    const { t } = useLanguage();
    const showNotification = useNotification();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, action }) => {
            let response;
            if (action === 'approve') {
                response = await adminRefundService.approveRefundOrder(id);
            } else if (action === 'reject') {
                response = await adminRefundService.rejectRefundOrder(id);
            } else if (action === 'complete') {
                response = await adminRefundService.completeRefundOrder(id);
            } else if (action === 'process-refund') {
                response = await adminRefundService.processMoneyRefund(id);
            }
            return response?.data || response;
        },
        onSuccess: () => {
            showNotification(t('success'), 'success', t('update_info_success'));
            queryClient.invalidateQueries({ queryKey: ['adminRefunds'] });
            queryClient.invalidateQueries({ queryKey: ['adminRefundDetail'] });
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        },
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                showNotification(t('error'), 'error', t('api_error_general'));
            }
        }
    });
};
