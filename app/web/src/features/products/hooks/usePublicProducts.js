import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notification } from 'antd';
import { useLanguage } from '@/store/LanguageContext';
import publicProductService from '@/features/products/services/publicProductService';

export const usePublicProducts = (params = {}) => {
    const { t } = useLanguage();

    const handleFetchError = (error) => {
        if (!error?.isGlobalHandled) {
            notification.error({ message: t('error'), description: t('api_error_fetch') });
        }
    };

    const queryParams = useMemo(() => {
        const cleanParams = { ...params };

        if (cleanParams.search) {
            cleanParams.search = String(cleanParams.search).trim();
        } else if (cleanParams.name) {
            cleanParams.search = String(cleanParams.name).trim();
            delete cleanParams.name;
        }

        if (cleanParams.categoryId === 'all' || !cleanParams.categoryId) {
            delete cleanParams.categoryId;
        }

        if (cleanParams.sort === 'default' || !cleanParams.sort) {
            delete cleanParams.sort;
        }

        return cleanParams;
    }, [params]);

    const productsQuery = useQuery({
        queryKey: ['publicProducts', queryParams],
        queryFn: async () => {
            const response = await publicProductService.getAll(queryParams);
            const products = response.data?.content || [];
            return {
                products,
                totalPages: response.data?.totalPages || 0,
                totalElements: response.data?.totalElements || 0,
            };
        },
        onError: handleFetchError,
    });

    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await publicProductService.getCategories();
            return response.data || [];
        },
        onError: handleFetchError,
        staleTime: 5 * 60 * 1000,
    });

    return {
        products: productsQuery.data?.products || [],
        totalPages: productsQuery.data?.totalPages || 0,
        totalItems: productsQuery.data?.totalElements || 0,
        categories: categoriesQuery.data || [],
        isLoading: productsQuery.status === 'pending' && productsQuery.fetchStatus !== 'idle',
        refetchProducts: productsQuery.refetch,
    };
};

export const useProductDetail = (id) => {
    const { t } = useLanguage();

    return useQuery({
        queryKey: ['productDetail', id],
        queryFn: async () => {
            const response = await publicProductService.getById(id);
            return response.data;
        },
        enabled: !!id,
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                notification.error({ message: t('error'), description: t('api_error_fetch') });
            }
        },
    });
};

export const useProductDetailByName = (name) => {
    const { t } = useLanguage();

    return useQuery({
        queryKey: ['productDetailByName', name],
        queryFn: async () => {
            const response = await publicProductService.getByName(name);
            return response.data;
        },
        enabled: !!name,
        onError: (error) => {
            if (!error?.isGlobalHandled) {
                notification.error({ message: t('error'), description: t('api_error_fetch') });
            }
        },
    });
};
