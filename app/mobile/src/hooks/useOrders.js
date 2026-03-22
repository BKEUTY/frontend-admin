import { useState, useCallback } from 'react';
import { orderApi } from '../api/orderApi';
import { showToast } from '../utils/ToastService';
import { useLanguage } from '../i18n/LanguageContext';

export const useOrders = () => {
    const { t } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchOrders = useCallback(async (page = 0, size = 10) => {
        setLoading(true);
        try {
            const res = await orderApi.getAllOrders(page, size);
            if (res.data && res.data.content) {
                setOrders(res.data.content);
                setPagination({
                    current: res.data.number + 1,
                    pageSize: res.data.size,
                    total: res.data.totalElements,
                });
            }
        } catch (error) {
            console.error(error);
            showToast(t('error'), 'error', t('api_error_general'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t]);

    const [orderDetail, setOrderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(true);

    const fetchOrderDetails = useCallback(async (id) => {
        setDetailLoading(true);
        try {
            const res = await orderApi.getOrderById(id);
            if (res.data) {
                setOrderDetail(res.data);
            }
        } catch (error) {
            console.error(error);
            showToast(t('error'), 'error', t('api_error_general'));
        } finally {
            setDetailLoading(false);
        }
    }, [t]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await orderApi.updateOrderStatus(orderId, newStatus);
            showToast(t('success'), 'success', 'Cập nhật trạng thái thành công');
            fetchOrders(pagination.current - 1, pagination.pageSize);
            if (orderDetail && orderDetail.orderId === orderId) {
                fetchOrderDetails(orderId);
            }
            return true;
        } catch (error) {
            console.error(error);
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
        updateStatus,
        orderDetail,
        detailLoading,
        fetchOrderDetails
    };
};
