import React, { useState } from 'react';
import { Table, Tooltip, Space, Select, Button } from 'antd';
import { SyncOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useAdminOrders, useUpdateOrderStatus } from '../../../hooks/useAdminOrders';
import { EmptyState, PageWrapper, CButton, Pagination } from '../../../Component/Common';
import '../../../Component/Admin/Common/List.css';

const OrderList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    const { 
        orders, 
        totalItems,
        totalPages, 
        isLoading, 
        refetchOrders 
    } = useAdminOrders({ page: currentPage, size: pageSize });

    const { mutateAsync: updateOrderStatus, isPending: isUpdating } = useUpdateOrderStatus();

    const handleStatusChange = async (orderId, value) => {
        try {
            await updateOrderStatus({ id: orderId, status: value });
        } catch (error) {}
    };

    const getStatusClass = (status) => {
        switch (status?.toUpperCase()) {
            case 'PAID':
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS':
            case 'UNPAID': return 'warning';
            case 'CANCELLED': return 'danger';
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
            key: 'customer',
            width: 200,
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="admin-table-product-name">{record.userName || t('guest')}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{record.userId || ''}</span>
                </div>
            ),
        },
        {
            title: t('admin_date'),
            dataIndex: 'orderDate',
            key: 'orderDate',
            width: 150,
            render: (date) => <span style={{ color: '#64748b' }}>{new Date(date).toLocaleDateString('vi-VN')}</span>,
        },
        {
            title: t('payment_method'),
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 150,
            render: (method) => <span className="admin-table-tag">{method}</span>,
        },
        {
            title: t('admin_total'),
            key: 'total',
            width: 150,
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="admin-current-price" style={{ color: '#10b981' }}>{(record.total || 0).toLocaleString("vi-VN")}đ</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{t('shipping_fee')}: {(record.shippingFee || 0).toLocaleString("vi-VN")}đ</span>
                </div>
            ),
        },
        {
            title: t('status'),
            dataIndex: 'status',
            key: 'status',
            width: 180,
            render: (status, record) => (
                <div className={`admin-status-badge ${getStatusClass(status)}`} style={{ padding: '0', display: 'inline-block' }}>
                    <Select
                        value={status}
                        bordered={false}
                        variant="borderless"
                        style={{ width: 140, fontWeight: 600 }}
                        onChange={(val) => handleStatusChange(record.id, val)}
                        options={[
                            { value: 'UNPAID', label: t('status_unpaid') },
                            { value: 'PAID', label: t('status_paid') },
                            { value: 'IN_PROGRESS', label: t('status_in_progress') },
                            { value: 'COMPLETED', label: t('status_completed') },
                            { value: 'CANCELLED', label: t('status_cancelled') }
                        ]}
                    />
                </div>
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
        <div className="admin-list-container">
            <PageWrapper
                title={t('admin_home_orders_title')}
                subtitle={<>{t('total')} • <strong className="admin-subtitle-count">{totalItems}</strong> {t('orders')?.toLowerCase()}</>}
                extra={
                    <div className="admin-header-buttons">
                        <CButton
                            type="secondary"
                            icon={<SyncOutlined />}
                            onClick={() => {
                                setCurrentPage(0);
                                refetchOrders();
                            }}
                            loading={isLoading || isUpdating}
                            className="admin-btn-responsive"
                        >
                            {t('refresh')}
                        </CButton>
                    </div>
                }
            >
                <div className="admin-table-wrapper">
                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="id"
                        className="beauty-table"
                        pagination={false}
                        loading={isLoading}
                        scroll={{ x: 'max-content' }}
                        locale={{ emptyText: <EmptyState description={t('no_orders')} /> }}
                    />
                    {orders && orders.length > 0 && totalPages > 1 && (
                        <div className="admin-custom-pagination">
                            <Pagination 
                                page={currentPage} 
                                totalPages={totalPages} 
                                totalItems={totalItems}
                                pageSize={pageSize}
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
