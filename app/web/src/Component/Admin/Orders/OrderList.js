import React, { useState } from 'react';
import { Table, Typography, Space, Tooltip, Tag, Select, Button } from 'antd';
import { SyncOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useAdminOrders } from '../../../hooks/useAdminOrders';
import { EmptyState, PageWrapper, CButton, Pagination } from '../../Common';
import './OrderList.css';

const { Text } = Typography;

const OrderList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    const { 
        data: orders, 
        totalItems,
        totalPages, 
        loading, 
        fetchOrders,
        updateOrderStatus 
    } = useAdminOrders(currentPage, pageSize, true);

    const handleStatusChange = async (orderId, value) => {
        try {
            await updateOrderStatus({ id: orderId, status: value });
        } catch (error) {}
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PAID':
            case 'COMPLETED': return 'success';
            case 'UNPAID':
            case 'PENDING': return 'warning';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: t('admin_order_id'),
            dataIndex: 'id',
            key: 'id',
            width: 120,
            align: 'center',
            render: (text) => <span className="admin-table-id">#{text}</span>,
        },
        {
            title: t('admin_customer'),
            dataIndex: 'userId',
            key: 'customer',
            width: 200,
            render: (userId) => <Text strong>{userId || t('guest')}</Text>,
        },
        {
            title: t('admin_date'),
            dataIndex: 'orderDate',
            key: 'orderDate',
            width: 150,
            render: (date) => <Text>{new Date(date).toLocaleDateString('vi-VN')}</Text>,
        },
        {
            title: t('payment_method'),
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 150,
            render: (method) => <Tag color="blue">{method}</Tag>,
        },
        {
            title: t('admin_total'),
            dataIndex: 'total',
            key: 'total',
            width: 150,
            render: (total) => <Text strong style={{ color: '#10b981' }}>{(total || 0).toLocaleString("vi-VN")}đ</Text>,
        },
        {
            title: t('status'),
            dataIndex: 'status',
            key: 'status',
            width: 180,
            render: (status, record) => (
                <Select
                    value={status}
                    style={{ width: 140 }}
                    onChange={(val) => handleStatusChange(record.id, val)}
                    options={[
                        { value: 'PENDING', label: t('status_pending') },
                        { value: 'UNPAID', label: t('status_unpaid') },
                        { value: 'PAID', label: t('status_paid') },
                        { value: 'COMPLETED', label: t('status_completed') },
                        { value: 'CANCELLED', label: t('status_cancelled') }
                    ]}
                    className={`status-select ${getStatusColor(status)}`}
                />
            ),
        },
        {
            title: t('admin_product_action'),
            key: 'action',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title={t('view')}>
                        <Button type="text" className="admin-action-btn edit-btn" icon={<EyeOutlined />} onClick={() => navigate(`/admin/orders/${record.id}`)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-order-list-container">
            <PageWrapper
                title={t('admin_orders')}
                subtitle={<>{t('total')} • <Text strong className="admin-subtitle-count">{totalItems}</Text> {t('orders')?.toLowerCase()}</>}
                extra={
                    <Space size="large" wrap className="admin-space-btn">
                        <CButton
                            type="secondary"
                            icon={<SyncOutlined />}
                            onClick={() => {
                                setCurrentPage(0);
                                fetchOrders();
                            }}
                            loading={loading}
                            className="admin-btn-responsive"
                        >
                            {t('refresh')}
                        </CButton>
                    </Space>
                }
            >
                <div className="admin-table-wrapper">
                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="id"
                        className="beauty-table"
                        pagination={false}
                        loading={loading}
                        scroll={{ x: 'max-content' }}
                        locale={{ emptyText: <EmptyState description={t('no_orders')} /> }}
                    />
                    {orders && orders.length > 0 && totalPages > 1 && (
                        <div className="admin-custom-pagination">
                            <Pagination 
                                page={currentPage} 
                                totalPages={totalPages} 
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }} 
                            />
                        </div>
                    )}
                </div>
            </PageWrapper>
        </div>
    );
};

export default OrderList;
