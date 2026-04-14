import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { useLanguage } from '@/store/LanguageContext';
import reviewService from '@/features/reviews/services/reviewService';
import publicReviewService from '@/features/reviews/services/publicReviewService';
import productService from '@/features/products/services/productService';

export const useReviews = (page, pageSize, selectedVariantId, ratingFilter, hasImageFilter, loadReviews = false) => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const handleMutationError = (error, actionKey) => {
        if (!error?.isGlobalHandled) {
            const status = error.response?.status;
            notification.error({
                key: actionKey,
                message: t('error'),
                description: (status === 403 || status === 400) ? t('review_not_eligible_msg') : (error.response?.data?.message || t('api_error_general'))
            });
        }
    };

    const invalidateReviews = () => {
        queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
        queryClient.invalidateQueries({ queryKey: ['adminReviewStats'] });
        queryClient.invalidateQueries({ queryKey: ['adminProductsList'] });
    };

    const productsQuery = useQuery({
        queryKey: ['adminProductsList'],
        queryFn: async () => {
            const response = await productService.getAll({ size: 1000 });
            return response.data;
        }
    });

    const statsQuery = useQuery({
        queryKey: ['adminReviewStats', selectedVariantId],
        queryFn: async () => {
            if (!selectedVariantId) return {};
            const response = await publicReviewService.getStatsByVariantId(selectedVariantId);
            return response.data;
        },
        enabled: !!selectedVariantId
    });

    const reviewsQuery = useQuery({
        queryKey: ['adminReviews', page, pageSize, selectedVariantId, ratingFilter, hasImageFilter],
        queryFn: async () => {
            if (!selectedVariantId || !loadReviews) return { reviews: { content: [], totalElements: 0, totalPages: 0 } };
            const response = await publicReviewService.getReviewsByVariantId(selectedVariantId, { 
                page, 
                size: pageSize,
                rating: ratingFilter,
                hasImage: hasImageFilter
            });
            return response.data;
        },
        enabled: !!selectedVariantId && !!loadReviews
    });

    const replyMutation = useMutation({
        mutationFn: async ({ reviewId, comment }) => {
            const response = await reviewService.replyToReview(reviewId, comment, { skipGlobalErrorHandler: true });
            return response.data;
        },
        onSuccess: invalidateReviews,
        onError: (error) => handleMutationError(error, 'reply_review'),
    });

    const updateReplyMutation = useMutation({
        mutationFn: async ({ replyId, comment }) => {
            const response = await reviewService.updateReply(replyId, comment, { skipGlobalErrorHandler: true });
            return response.data;
        },
        onSuccess: invalidateReviews,
        onError: (error) => handleMutationError(error, 'update_reply'),
    });

    const deleteReplyMutation = useMutation({
        mutationFn: async (replyId) => {
            const response = await reviewService.deleteReply(replyId, { skipGlobalErrorHandler: true });
            return response.data;
        },
        onSuccess: invalidateReviews,
        onError: (error) => handleMutationError(error, 'delete_reply'),
    });

    const deleteReviewMutation = useMutation({
        mutationFn: async (reviewId) => {
            const response = await reviewService.delete(reviewId, { skipGlobalErrorHandler: true });
            return response.data;
        },
        onSuccess: invalidateReviews,
        onError: (error) => handleMutationError(error, 'delete_review'),
    });

    return {
        productsData: productsQuery.data,
        isProductsLoading: productsQuery.isLoading,
        reviewsData: reviewsQuery.data?.reviews,
        ratingCounts: statsQuery.data || {},
        isReviewsLoading: reviewsQuery.isLoading,
        isStatsLoading: statsQuery.isLoading,
        replyToReview: replyMutation.mutateAsync,
        isReplying: replyMutation.isPending,
        updateReply: updateReplyMutation.mutateAsync,
        isUpdatingReply: updateReplyMutation.isPending,
        deleteReply: deleteReplyMutation.mutateAsync,
        isDeletingReply: deleteReplyMutation.isPending,
        deleteReview: deleteReviewMutation.mutateAsync,
        isDeletingReview: deleteReviewMutation.isPending,
    };
};
