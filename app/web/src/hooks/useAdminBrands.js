import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminBrandApi from '../api/adminBrandApi';
import { notification } from 'antd';
import { useLanguage } from '../i18n/LanguageContext';

export const useAdminBrands = (params = {}, options = {}) => {
    const brandsQuery = useQuery({
        queryKey: ['adminBrands', params],
        queryFn: async () => {
            const response = await adminBrandApi.getAll(params);
            return {
                content: response.data?.content || [],
                totalPages: response.data?.totalPages || 0,
                totalElements: response.data?.totalElements || 0,
            };
        },
        ...options,
    });

    return {
        brands: brandsQuery.data?.content || [],
        totalPages: brandsQuery.data?.totalPages || 0,
        totalItems: brandsQuery.data?.totalElements || 0,
        isLoading: brandsQuery.isPending,
        refetchBrands: brandsQuery.refetch,
    };
};

export const useAdminBrandDetail = (id, options = {}) => {
    return useQuery({
        queryKey: ['adminBrandDetail', id],
        queryFn: async () => {
            const response = await adminBrandApi.getById(id);
            return response.data;
        },
        enabled: !!id,
        ...options,
    });
};

export const useCreateBrand = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => adminBrandApi.create(data),
        onSuccess: () => {
            notification.success({ 
                key: 'create_brand',
                message: t('success'), 
                description: t('update_success') 
            });
            queryClient.invalidateQueries({ queryKey: ['adminBrands'] });
        },
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                notification.error({ 
                    key: 'create_brand',
                    message: t('error'), 
                    description: t('api_error_general') 
                });
            }
        }
    });
};

export const useUpdateBrand = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => adminBrandApi.update(id, data),
        onSuccess: () => {
            notification.success({ 
                key: 'update_brand',
                message: t('success'), 
                description: t('update_success') 
            });
            queryClient.invalidateQueries({ queryKey: ['adminBrands'] });
            queryClient.invalidateQueries({ queryKey: ['adminBrandDetail'] });
        },
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                notification.error({ 
                    key: 'update_brand',
                    message: t('error'), 
                    description: t('api_error_general') 
                });
            }
        }
    });
};

export const useDeleteBrand = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => adminBrandApi.delete(id),
        onSuccess: () => {
            notification.success({ 
                key: 'delete_brand',
                message: t('success'), 
                description: t('delete_success') 
            });
            queryClient.invalidateQueries({ queryKey: ['adminBrands'] });
        },
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                notification.error({ 
                    key: 'delete_brand',
                    message: t('error'), 
                    description: t('delete_error') 
                });
            }
        }
    });
};
