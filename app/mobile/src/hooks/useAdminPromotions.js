import { useState, useCallback } from 'react';
import promotionApi from '../api/promotionApi';
import { showToast } from '../utils/ToastService';
import { useLanguage } from '../i18n/LanguageContext';

export const useAdminPromotions = () => {
    const { t } = useLanguage();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 30, total: 0 });

    const fetchPromotions = useCallback(async (page = 1, isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        
        try {
            const res = await promotionApi.getAll({ page });
            const data = res.data || res;
            if (data && data.content) {
                setPromotions(data.content);
                setPagination({
                    current: (data.number || 0) + 1,
                    pageSize: data.size || 30,
                    total: data.totalElements || 0,
                });
            }
        } catch (error) {
            showToast(t('error'), 'error', t('api_error_general'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t]);

    const createPromotion = async (data) => {
        try {
            await promotionApi.create(data);
            showToast(t('success'), 'success', t('create_success') || 'Created successfully');
            fetchPromotions(1);
            return true;
        } catch (error) {
            showToast(t('error'), 'error', t('api_error_general'));
            return false;
        }
    };

    const updatePromotion = async (id, data) => {
        try {
            await promotionApi.update(id, data);
            showToast(t('success'), 'success', t('update_info_success'));
            fetchPromotions(pagination.current);
            return true;
        } catch (error) {
            showToast(t('error'), 'error', t('api_error_general'));
            return false;
        }
    };

    return {
        promotions,
        loading,
        refreshing,
        setRefreshing,
        pagination,
        fetchPromotions,
        createPromotion,
        updatePromotion
    };
};
