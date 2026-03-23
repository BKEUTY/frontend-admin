import { useState, useCallback } from 'react';
import { orderApi } from '../api/orderApi';
import { showToast } from '../utils/ToastService';
import { useLanguage } from '../i18n/LanguageContext';

export const useAdminOrders = () => {
    const { t } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchOrders = useCallback(async (page = 0, size = 10) => {
        setLoading(true);
        try {
            const res = await orderApi.getAllOrders(page, size);
            const data = res.data || res;
            if (data && data.content) {
                setOrders(data.content);
                setPagination({
                    current: (data.number || 0) + 1,
                    pageSize: data.size || size,
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

    const [orderDetail, setOrderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchOrderDetail = useCallback(async (id) => {
        setDetailLoading(true);
        try {
            const res = await orderApi.getOrderById(id);
            const data = res.data || res;
            setOrderDetail(data);
        } catch (error) {
            showToast(t('error'), 'error', t('api_error_fetch'));
        } finally {
            setDetailLoading(false);
        }
    }, [t]);

    const updateOrderStatus = async ({ id, status }) => {
        try {
            await orderApi.updateOrderStatus(id, status);
            showToast(t('success'), 'success', t('update_info_success'));
            fetchOrders(pagination.current - 1, pagination.pageSize);
            if (orderDetail && (orderDetail.orderId === id || orderDetail.id === id)) {
                fetchOrderDetail(id);
            }
            return true;
        } catch (error) {
            showToast(t('error'), 'error', t('api_error_general'));
            return false;
        }
    };

    return {
        orders,
        loading,
        refreshing,
        setRefreshing,
        pagination,
        fetchOrders,
        updateOrderStatus,
        orderDetail,
        detailLoading,
        fetchOrderDetail
    };
};
