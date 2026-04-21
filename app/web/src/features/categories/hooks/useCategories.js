import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import categoryService from '@/features/categories/services/categoryService';
import { useLanguage } from '@/store/LanguageContext';
import { useMemo } from 'react';

export const useCategories = (params = {}, options = {}) => {
    const queryParams = useMemo(() => {
        const cleanParams = { ...params };
        if (cleanParams.search) {
            cleanParams.search = String(cleanParams.search).trim();
        }
        return cleanParams;
    }, [params]);

    const categoriesQuery = useQuery({
        queryKey: ['adminCategories', queryParams],
        queryFn: async () => {
            const response = await categoryService.getAll(queryParams);
            return {
                content: response.data,
                totalPages: 1,
                totalElements: response.data.length,
            };
        },
        ...options,
    });

    return {
        categories: categoriesQuery.data?.content || [],
        totalPages: categoriesQuery.data?.totalPages || 0,
        totalItems: categoriesQuery.data?.totalElements || 0,
        isLoading: categoriesQuery.isPending,
        refetchCategories: categoriesQuery.refetch,
    };
};

export const useAdminCategoryDetail = (id, options = {}) => {
    return useQuery({
        queryKey: ['adminCategoryDetail', id],
        queryFn: async () => {
            const response = await categoryService.getById(id);
            return response.data;
        },
        enabled: !!id,
        ...options,
    });
};

export const useCreateCategory = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => categoryService.create(data),
        onSuccess: () => {
            notification.success({ 
                key: 'create_category',
                message: t('success'), 
                description: t('update_success') 
            });
            queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
        },
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                notification.error({ 
                    key: 'create_category',
                    message: t('error'), 
                    description: t('api_error_general') 
                });
            }
        }
    });
};

export const useUpdateCategory = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => categoryService.update(id, data),
        onSuccess: () => {
            notification.success({ 
                key: 'update_category',
                message: t('success'), 
                description: t('update_success') 
            });
            queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
            queryClient.invalidateQueries({ queryKey: ['adminCategoryDetail'] });
        },
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                notification.error({ 
                    key: 'update_category',
                    message: t('error'), 
                    description: t('api_error_general') 
                });
            }
        }
    });
};

export const useDeleteCategory = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => categoryService.delete(id),
        onSuccess: () => {
            notification.success({ 
                key: 'delete_category',
                message: t('success'), 
                description: t('delete_success') 
            });
            queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
        },
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                notification.error({ 
                    key: 'delete_category',
                    message: t('error'), 
                    description: t('delete_error') 
                });
            }
        }
    });
};
