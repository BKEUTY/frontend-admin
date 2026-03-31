import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { useLanguage } from '../i18n/LanguageContext';
import adminProductApi from '../api/adminProductApi';

export const useAdminProducts = () => {
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
    };

    const deleteVariantMutation = useMutation({
        mutationFn: async (id) => {
            const response = await adminProductApi.deleteVariant(id);
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

    const createProductMutation = useMutation({
        mutationFn: async (data) => {
            const response = await adminProductApi.create(data);
            return response.data;
        },
        onSuccess: invalidateProducts,
        onError: (error) => handleMutationError(error, 'create_product'),
    });

    const updateProductMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await adminProductApi.update(id, data);
            return response.data;
        },
        onSuccess: invalidateProducts,
        onError: (error) => handleMutationError(error, 'update_product'),
    });

    const uploadProductImageMutation = useMutation({
        mutationFn: async ({ file, productId }) => {
            const response = await adminProductApi.uploadProductImage(file, productId);
            return response.data;
        },
        onSuccess: invalidateProducts,
        onError: (error) => handleMutationError(error, 'upload_image'),
    });

    const createOptionMutation = useMutation({
        mutationFn: async (data) => {
            const response = await adminProductApi.createOption(data);
            return response.data;
        },
        onError: (error) => handleMutationError(error, 'create_option'),
    });

    const uploadSkuImageMutation = useMutation({
        mutationFn: async ({ file, skuId }) => {
            const response = await adminProductApi.uploadSkuImage(file, skuId);
            return response.data;
        },
        onError: (error) => handleMutationError(error, 'upload_sku_image'),
    });

    const updateVariantMutation = useMutation({
        mutationFn: async (data) => {
            const response = await adminProductApi.updateVariant(data);
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

    return {
        deleteVariant: deleteVariantMutation.mutateAsync,
        isDeleting: deleteVariantMutation.isPending,
        createProduct: createProductMutation.mutateAsync,
        isCreating: createProductMutation.isPending,
        updateProduct: updateProductMutation.mutateAsync,
        isUpdating: updateProductMutation.isPending,
        uploadProductImage: uploadProductImageMutation.mutateAsync,
        isUploadingImage: uploadProductImageMutation.isPending,
        createOption: createOptionMutation.mutateAsync,
        isCreatingOption: createOptionMutation.isPending,
        uploadSkuImage: uploadSkuImageMutation.mutateAsync,
        isUploadingSkuImage: uploadSkuImageMutation.isPending,
        updateVariant: updateVariantMutation.mutateAsync,
        isUpdatingVariant: updateVariantMutation.isPending,
    };
};
