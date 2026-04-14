import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import promotionService from '@/features/promotions/services/promotionService';
import { useLanguage } from '@/store/LanguageContext';

export const usePromotions = (params = {}, options = {}) => {
    const promotionsQuery = useQuery({
        queryKey: ['adminPromotions', params],
        queryFn: async () => {
            const response = await promotionService.getAll(params);
            const data = response.data;
            return {
                content: data?.content || [],
                totalPages: data?.totalPages || 0,
                totalElements: data?.totalElements || 0,
            };
        },
        ...options,
    });

    return {
        data: promotionsQuery.data?.content || [],
        totalPages: promotionsQuery.data?.totalPages || 0,
        totalItems: promotionsQuery.data?.totalElements || 0,
        isLoading: promotionsQuery.isPending,
        refetchPromotions: promotionsQuery.refetch,
    };
};

export const usePromotionDetail = (id, options = {}) => {
    return useQuery({
        queryKey: ['adminPromotionDetail', id],
        queryFn: async () => {
            const response = await promotionService.getById(id);
            return response.data;
        },
        enabled: !!id,
        ...options,
    });
};

export const useCreatePromotion = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => promotionService.create(data),
        onSuccess: () => {
            notification.success({ 
                key: 'create_promotion',
                message: t('success'), 
                description: t('promo_create_success') 
            });
            queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
        },
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                notification.error({ 
                    key: 'create_promotion',
                    message: t('error'), 
                    description: t('api_error_general') 
                });
            }
        }
    });
};

export const useUpdatePromotion = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }) => {
            return promotionService.update(id, data)
        },
        onSuccess: () => {
            notification.success({ 
                key: 'update_promotion',
                message: t('success'), 
                description: t('promo_update_success') 
            });
            queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
            queryClient.invalidateQueries({ queryKey: ['adminPromotionDetail'] });
        },
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                notification.error({ 
                    key: 'update_promotion',
                    message: t('error'), 
                    description: t('api_error_general') 
                });
            }
        }
    });
};

export const useDeletePromotion = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => promotionService.delete(id),
        onSuccess: () => {
            notification.success({ 
                key: 'delete_promotion',
                message: t('success'), 
                description: t('delete_success') 
            });
            queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
        },
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                notification.error({ 
                    key: 'delete_promotion',
                    message: t('error'), 
                    description: t('delete_error') 
                });
            }
        }
    });
};
