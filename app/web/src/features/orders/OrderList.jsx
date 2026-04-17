import React from 'react';
import { Table, Tooltip, Space, Select, DatePicker, Segmented } from 'antd';
import { SyncOutlined, EyeOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useLanguage } from '@/store/LanguageContext';
import { useOrders, useUpdateOrderStatus } from '@/features/orders/hooks/useOrders';
import { EmptyState, PageWrapper, CButton, Pagination } from '@/components/common';
import useQueryParams from '@/hooks/useQueryParams';
import '@/components/layouts/AdminLayout.css';
import '@/admin-list.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [query, setQuery] = useQueryParams();
    
    const page = query.page ? Number(query.page) : 1;
    const pageSize = 10;
    const status = query.status || 'ALL';
    const sort = query.sort || 'default';
    const startDate = query.startDate || null;
    const endDate = query.endDate || null;

    const { 
        orders, 
        totalItems,
        totalPages, 
        isLoading, 
        refetchOrders 
    } = useOrders({
        page,
        size: pageSize,
        status: status === 'ALL' ? null : status,
        sort,
        startDate,
        endDate,
    });

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
            case 'IN_PROGRESS': return 'warning';
            case 'UNPAID': return 'processing';
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
            align: 'center',
            render: (date) => <span style={{ color: '#64748b' }}>{dayjs(date).format('DD/MM/YYYY')}</span>,
        },
        {
            title: t('payment_method'),
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 150,
            align: 'center',
            render: (method) => <span className="admin-table-tag">{method}</span>,
        },
        {
            title: t('total'),
            key: 'total',
            width: 180,
            align: 'center',
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="admin-current-price" style={{ color: '#10b981' }}>{(record.total || 0).toLocaleString("vi-VN")}{t('admin_unit_vnd')}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{t('shipping_fee')}: {(record.shippingFee || 0).toLocaleString("vi-VN")}{t('admin_unit_vnd')}</span>
                </div>
            ),
        },
        {
            title: t('status'),
            dataIndex: 'status',
            key: 'status',
            width: 180,
            align: 'center',
            render: (status, record) => (
                <div className={`admin-status-badge ${getStatusClass(status)}`} style={{ padding: '0', display: 'inline-block' }}>
                    <Select
                        value={status}
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
            title: t('actions_col'),
            key: 'action',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title={t('view')}>
                        <CButton type="text" className="admin-action-btn edit-btn" icon={<EyeOutlined />} onClick={() => navigate(`/admin/orders/${record.id}`)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-list-container">
            <PageWrapper
                title={t('admin_home_orders_title')}
                subtitle={<>{t('total')} • <strong className="admin-subtitle-count">{totalItems}</strong> {t('admin_dashboard_orders')?.toLowerCase()}</>}
                extra={
                    <div className="admin-header-buttons">
                        <CButton
                            type="secondary"
                            icon={<SyncOutlined />}
                            onClick={() => refetchOrders()}
                            loading={isLoading || isUpdating}
                        >
                            {t('refresh')}
                        </CButton>
                    </div>
                }
            >
                <div className="admin-filter-bar">
                    <div className="admin-filter-left">
                        <FilterOutlined style={{ color: '#94a3b8', fontSize: '16px' }} />
                        <Select 
                            value={status} 
                            onChange={(val) => setQuery({ ...query, status: val, page: 1 })} 
                            className="admin-toolbar-select"
                            placeholder={t('status')}
                            style={{ minWidth: 160 }}
                        >
                            <Option value="ALL">{t('all')}</Option>
                            <Option value="UNPAID">{t('status_unpaid')}</Option>
                            <Option value="PAID">{t('status_paid')}</Option>
                            <Option value="IN_PROGRESS">{t('status_in_progress')}</Option>
                            <Option value="COMPLETED">{t('status_completed')}</Option>
                            <Option value="CANCELLED">{t('status_cancelled')}</Option>
                        </Select>

                            <RangePicker 
                                value={startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null}
                                onChange={(dates) => {
                                    setQuery({
                                        ...query,
                                        startDate: dates ? dates[0].format('YYYY-MM-DD') : null,
                                        endDate: dates ? dates[1].format('YYYY-MM-DD') : null,
                                        page: 1
                                    });
                                }}
                                className="admin-date-picker-range-luxury"
                                placeholder={[t('startDate'), t('endDate')]}
                            />
                    </div>

                    <div className="admin-toolbar-right">
                        <SortAscendingOutlined style={{ color: '#94a3b8', fontSize: '16px' }} />
                        <Select 
                            value={sort} 
                            onChange={(val) => setQuery({ ...query, sort: val, page: 1 })} 
                            className="admin-toolbar-select"
                            style={{ minWidth: 200 }}
                        >
                            <Option value="default">{t('sort_default')}</Option>
                            <Option value="date_desc">{t('sort_time_newest')}</Option>
                            <Option value="date_asc">{t('sort_time_oldest')}</Option>
                            <Option value="total_desc">{t('sort_price_desc')}</Option>
                            <Option value="total_asc">{t('sort_price_asc')}</Option>
                        </Select>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="id"
                        className="beauty-table"
                        pagination={false}
                        loading={isLoading}
                        scroll={{ x: 'max-content' }}
                        onRow={(record) => ({
                            onClick: () => navigate(`/admin/orders/${record.id}`),
                            className: "admin-table-row-pointer"
                        })}
                        locale={{ emptyText: <EmptyState description={t('no_orders')} /> }}
                    />
                    {orders && orders.length > 0 && totalPages > 1 && (
                        <div className="admin-custom-pagination">
                            <Pagination 
                                page={page} 
                                totalPages={totalPages} 
                                totalItems={totalItems}
                                pageSize={pageSize}
                                onPageChange={(p) => setQuery({ ...query, page: p })} 
                            />
                        </div>
                    )}
                </div>
            </PageWrapper>
        </div>
    );
};

export default OrderList;
