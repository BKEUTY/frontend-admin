import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import productService from '@/features/products/services/productService';
import { useLanguage } from '@/store/LanguageContext';

export const useProducts = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const handleMutationError = (error, actionKey) => {
        if (!error?.isGlobalHandled) {
            notification.error({
                key: actionKey,
                message: t('error'),
                description: t('api_error_general')
            });
        }
    };

    const invalidateProducts = () => {
        queryClient.invalidateQueries({ queryKey: ['publicProducts'] });
        queryClient.invalidateQueries({ queryKey: ['productDetail'] });
        queryClient.invalidateQueries({ queryKey: ['productDetailByName'] });
        queryClient.invalidateQueries({ queryKey: ['adminProductOptions'] });
    };

    const optionsQuery = useQuery({
        queryKey: ['adminProductOptions'],
        queryFn: async () => {
            const response = await productService.getAllOptions();
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const createProductMutation = useMutation({
        mutationFn: async ({ data, images }) => {
            const response = await productService.createProduct(data, images);
            return response.data;
        },
        onSuccess: invalidateProducts,
        onError: (error) => handleMutationError(error, 'create_product'),
    });

    const updateProductMutation = useMutation({
        mutationFn: async ({ data, images }) => {
            const response = await productService.updateProduct(data, images);
            return response.data;
        },
        onSuccess: () => {
            notification.success({
                key: 'update_product',
                message: t('success'),
                description: t('update_success')
            });
            invalidateProducts();
        },
        onError: (error) => handleMutationError(error, 'update_product'),
    });

    const updateVariantMutation = useMutation({
        mutationFn: async ({ data, images }) => {
            const response = await productService.updateVariant(data, images);
            return response.data;
        },
        onSuccess: () => {
            notification.success({
                key: 'update_variant',
                message: t('success'),
                description: t('update_success')
            });
            invalidateProducts();
        },
        onError: (error) => handleMutationError(error, 'update_variant'),
    });

    const deleteVariantMutation = useMutation({
        mutationFn: async (id) => {
            const response = await productService.deleteVariant(id);
            return response.data;
        },
        onSuccess: () => {
            notification.success({
                key: 'delete_variant',
                message: t('success'),
                description: t('delete_success')
            });
            invalidateProducts();
        },
        onError: (error) => handleMutationError(error, 'delete_variant'),
    });

    const createOptionMutation = useMutation({
        mutationFn: async (data) => {
            const response = await productService.createOption(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProductOptions'] });
        },
        onError: (error) => handleMutationError(error, 'create_option'),
    });

    return {
        availableOptions: optionsQuery.data,
        isLoadingOptions: optionsQuery.isLoading,
        createProduct: createProductMutation.mutateAsync,
        isCreating: createProductMutation.isPending,
        updateProduct: updateProductMutation.mutateAsync,
        isUpdating: updateProductMutation.isPending,
        updateVariant: updateVariantMutation.mutateAsync,
        isUpdatingVariant: updateVariantMutation.isPending,
        deleteVariant: deleteVariantMutation.mutateAsync,
        isDeleting: deleteVariantMutation.isPending,
        createOption: createOptionMutation.mutateAsync,
        isCreatingOption: createOptionMutation.isPending,
    };
};
