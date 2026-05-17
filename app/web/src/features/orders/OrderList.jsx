import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tooltip, Space, Select, DatePicker, Input } from 'antd';
import { SyncOutlined, EyeOutlined, FilterOutlined, SortAscendingOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useLanguage } from '@/store/LanguageContext';
import { useOrders, useUpdateOrderStatus } from '@/features/orders/hooks/useOrders';
import { EmptyState, PageWrapper, CButton, Pagination } from '@/components/common';
import useQueryParams from '@/hooks/useQueryParams';
import { useDebounce } from '@/hooks/useDebounce';
import '@/components/layouts/AdminLayout.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;
import '@/admin-list.css';

const OrderList = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [query, setQuery] = useQueryParams();
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    
    const page = query.page ? Number(query.page) : 1;
    const pageSize = 10;
    const status = query.status || 'ALL';
    const sort = query.sort || 'default';
    const startDate = query.startDate || null;
    const endDate = query.endDate || null;
    const searchText = query.search || '';
    const [searchInput, setSearchInput] = useState(searchText);
    const debouncedSearch = useDebounce(searchInput, 500);

    const queryParams = useMemo(() => ({
        page,
        size: pageSize,
        status: status,
        sort,
        startDate,
        endDate,
        search: searchText,
    }), [page, pageSize, status, sort, startDate, endDate, searchText]);

    const { 
        orders, 
        totalItems,
        totalPages, 
        isLoading, 
        refetchOrders 
    } = useOrders(queryParams);

    const { mutateAsync: updateOrderStatus, isPending: isUpdating } = useUpdateOrderStatus();

    useEffect(() => {
        if (!searchText) setSearchInput('');
    }, [searchText]);

    useEffect(() => {
        if (debouncedSearch !== searchInput) return;

        const cleanSearch = String(debouncedSearch ?? '').trim();
        if (cleanSearch !== searchText) {
            setQuery({ search: cleanSearch || null, page: 1 });
        }
    }, [debouncedSearch, searchInput, searchText, setQuery]);

    const handleStatusChange = async (orderId, value, paymentMethod) => {
        try {
            let paymentStatus = null;
            let orderStatus = value;

            if (paymentMethod?.toUpperCase() === 'BANK') {
                if (value === 'NOT_CONFIRMED') {
                    paymentStatus = 'UNPAID';
                    orderStatus = 'NOT_CONFIRMED';
                } else if (value === 'CONFIRMED_UNPAID') {
                    orderStatus = 'CONFIRMED';
                    paymentStatus = 'UNPAID';
                } else if (value === 'CONFIRMED_PAID') {
                    orderStatus = 'CONFIRMED';
                    paymentStatus = 'PAID';
                } else if (value === 'SUCCEEDED') {
                    paymentStatus = 'PAID';
                    orderStatus = 'SUCCEEDED';
                }
            } else { // COD
                if (value === 'NOT_CONFIRMED') {
                    paymentStatus = 'UNPAID';
                    orderStatus = 'NOT_CONFIRMED';
                } else if (value === 'CONFIRMED') {
                    paymentStatus = 'UNPAID';
                    orderStatus = 'CONFIRMED';
                } else if (value === 'SUCCEEDED') {
                    paymentStatus = 'PAID';
                    orderStatus = 'SUCCEEDED';
                }
            }

            await updateOrderStatus({ id: orderId, status: orderStatus, paymentStatus });
        } catch (error) {}
    };

    const getStatusClass = (order) => {
        const orderS = order.status?.toUpperCase();
        const payS = order.paymentStatus?.toUpperCase();
        const payM = order.paymentMethod?.toUpperCase();

        if (orderS === 'SUCCEEDED') return 'success';
        if (orderS === 'CANCELLED') return 'danger';
        if (payM === 'BANK' && payS === 'UNPAID' && orderS === 'CONFIRMED') return 'warning';
        if (orderS === 'CONFIRMED') return 'info';
        return 'default';
    };

    const columns = [
        {
            title: t('admin_order_id'),
            dataIndex: 'orderId',
            key: 'orderId',
            width: 90,
            align: 'center',
            render: (text) => <span className="admin-table-id">#{text}</span>,
        },
        {
            title: t('admin_customer'),
            key: 'customer',
            width: 220,
            ellipsis: true,
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
            width: 120,
            align: 'center',
            render: (date) => <span style={{ color: '#64748b' }}>{dayjs(date).format('DD/MM/YYYY')}</span>,
        },
        {
            title: t('payment_method'),
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 200,
            align: 'center',
            render: (method) => {
                const methodKey = `payment_method_${method?.toUpperCase()}`;
                const colorMap = {
                    'BANK': '#3b82f6',
                    'COD': '#f59e0b',
                    'CASH': '#10b981'
                };
                const color = colorMap[method?.toUpperCase()] || '#64748b';
                return (
                    <span 
                        className="admin-table-tag" 
                        style={{ 
                            color: color, 
                            borderColor: `${color}33`, 
                            backgroundColor: `${color}11`,
                            fontWeight: 600
                        }}
                    >
                        {t(methodKey)}
                    </span>
                );
            },
        },
        {
            title: t('grand_total'),
            key: 'total',
            width: 160,
            align: 'right',
            render: (_, record) => {
                const grandTotal = (Number(record.total) || 0) + (Number(record.shippingFee) || 0);
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <span className="admin-current-price" style={{ color: 'var(--admin-primary)', fontWeight: 700, fontSize: '15px' }}>
                            {grandTotal.toLocaleString(locale)}{t('admin_unit_vnd')}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '10px', color: '#94a3b8', lineHeight: '1.4' }}>
                            <span>{t('subtotal')}: {(record.total || 0).toLocaleString(locale)}{t('admin_unit_vnd')}</span>
                            <span>{t('shipping_fee')}: {(record.shippingFee || 0).toLocaleString(locale)}{t('admin_unit_vnd')}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            title: t('status'),
            dataIndex: 'status',
            key: 'status',
            width: 160,
            align: 'center',
            render: (status, record) => (
                <div className={`admin-status-badge ${getStatusClass(record)}`} style={{ padding: '0', display: 'inline-block' }}>
                    <Select
                        value={record.paymentMethod?.toUpperCase() === 'BANK' && record.status === 'CONFIRMED' ? (record.paymentStatus === 'PAID' ? 'CONFIRMED_PAID' : 'CONFIRMED_UNPAID') : record.status}
                        variant="borderless"
                        style={{ width: 140, fontWeight: 600 }}
                        onChange={(val) => handleStatusChange(record.orderId, val, record.paymentMethod)}
                        options={[
                            { value: 'NOT_CONFIRMED', label: t('status_order_received') },
                            ...(record.paymentMethod?.toUpperCase() === 'BANK' 
                                ? [{ value: 'CONFIRMED_UNPAID', label: t('status_awaiting_payment') },
                                    { value: 'CONFIRMED_PAID', label: t('status_shipping') }]
                                : [
                                    { value: 'CONFIRMED', label: t('status_shipping') }
                                ]),
                            { value: 'SUCCEEDED', label: t('order_status_SUCCEEDED') },
                            { value: 'CANCELLED', label: t('order_status_CANCELLED') }
                        ]}
                    />
                </div>
            ),
        },
        {
            title: t('actions_col'),
            key: 'action',
            width: 80,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title={t('view')}>
                        <CButton type="text" className="admin-action-btn edit-btn" icon={<EyeOutlined />} onClick={() => navigate(`/admin/orders/${record.orderId}`)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-list-container">
            <PageWrapper
                title={t('admin_home_orders_title')}
                subtitle={<>{t('total')} • <strong className="admin-subtitle-count">{totalItems}</strong> {t('admin_unit_order')}</>}
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
                        <Input
                            placeholder={t('admin_order_search_placeholder')}
                            allowClear
                            value={searchInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchInput(val);
                                if (!val) {
                                    setQuery({ search: null, page: 1 });
                                }
                            }}
                            onPressEnter={() => setQuery({ search: searchInput?.trim() || null, page: 1 })}
                            className="admin-toolbar-search admin-unified-input"
                            suffix={<SearchOutlined style={{ color: 'var(--admin-primary)', fontSize: '18px', cursor: 'pointer' }} onClick={() => setQuery({ search: searchInput?.trim() || null, page: 1 })} />}
                        />
                        <div className="admin-select-wrapper">
                            <Select 
                                value={status} 
                                onChange={(val) => setQuery({ status: val, page: 1 })} 
                                className="admin-toolbar-select admin-custom-select"
                                placeholder={t('status')}
                                suffixIcon={
                                    <div className="admin-select-suffix">
                                        <FilterOutlined style={{ color: 'var(--admin-primary)', fontSize: '16px' }} />
                                        <DownOutlined style={{ fontSize: '12px', opacity: 0.6 }} />
                                    </div>
                                }
                                variant="borderless"
                                options={[
                                    { value: 'ALL', label: t('all') },
                                    { value: 'NOT_CONFIRMED', label: t('status_order_received') },
                                    { value: 'CONFIRMED', label: t('status_shipping') },
                                    { value: 'SUCCEEDED', label: t('order_status_SUCCEEDED') },
                                    { value: 'CANCELLED', label: t('order_status_CANCELLED') }
                                ]}
                            />
                        </div>
                        <RangePicker 
                            value={startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null}
                            onChange={(dates) => {
                                setQuery({
                                    startDate: dates ? dates[0].format('YYYY-MM-DD') : null,
                                    endDate: dates ? dates[1].format('YYYY-MM-DD') : null,
                                    page: 1
                                });
                            }}
                            className="admin-date-picker-range-luxury"
                            allowClear
                            suffixIcon={<FilterOutlined style={{ color: 'var(--admin-primary)', fontSize: '16px' }} />}
                        />
                    </div>

                    <div className="admin-toolbar-right">
                        <div className="admin-select-wrapper">
                            <Select 
                                value={sort} 
                                onChange={(val) => setQuery({ sort: val, page: 1 })} 
                                className="admin-toolbar-select admin-custom-select"
                                suffixIcon={
                                    <div className="admin-select-suffix">
                                        <SortAscendingOutlined style={{ color: 'var(--admin-primary)', fontSize: '16px' }} />
                                        <DownOutlined style={{ fontSize: '12px', opacity: 0.6 }} />
                                    </div>
                                }
                                variant="borderless"
                                options={[
                                    { value: 'default', label: t('sort_default') },
                                    { value: 'date_desc', label: t('sort_time_newest') },
                                    { value: 'date_asc', label: t('sort_time_oldest') },
                                    { value: 'total_desc', label: t('sort_price_desc') },
                                    { value: 'total_asc', label: t('sort_price_asc') }
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="orderId"
                        className="beauty-table"
                        pagination={false}
                        loading={isLoading}
                        scroll={{ x: 'max-content' }}
                        onRow={(record) => ({
                            onClick: () => navigate(`/admin/orders/${record.orderId}`),
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
                                onPageChange={(p) => setQuery({ page: p })} 
                            />
                        </div>
                    )}
                </div>
            </PageWrapper>
        </div>
    );
};

export default OrderList;
