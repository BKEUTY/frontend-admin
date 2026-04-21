import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tooltip, Space, Select, DatePicker, Input } from 'antd';
import { SyncOutlined, EyeOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';
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

    const handleStatusChange = async (orderId, value) => {
        try {
            await updateOrderStatus({ id: orderId, status: value });
        } catch (error) {}
    };

    const getStatusClass = (order) => {
        const orderS = order.status?.toUpperCase();
        const payS = order.paymentStatus?.toUpperCase();
        const payM = order.paymentMethod?.toUpperCase();

        if (orderS === 'SUCCEEDED') return 'success';
        if (orderS === 'CANCELLED') return 'danger';
        if (payM === 'BANK' && payS === 'UNPAID') return 'warning';
        if (orderS === 'CONFIRMED') return 'info';
        return 'default';
    };

    const columns = [
        {
            title: t('admin_order_id'),
            dataIndex: 'id',
            key: 'id',
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
            width: 120,
            align: 'center',
            render: (method) => <span className="admin-table-tag">{method}</span>,
        },
        {
            title: t('grand_total'),
            key: 'total',
            width: 160,
            align: 'right',
            render: (_, record) => {
                const grandTotal = (Number(record.total) || 0) + (Number(record.shippingFee) || 0);
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span className="admin-current-price" style={{ color: 'var(--admin-primary)', fontWeight: 700, fontSize: '15px' }}>
                            {grandTotal.toLocaleString(locale)}{t('admin_unit_vnd')}
                        </span>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                            <span>{t('subtotal')}: {(record.total || 0).toLocaleString(locale)}{t('admin_unit_vnd')}</span>
                            <span style={{ margin: '0 4px' }}>•</span>
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
                        value={status}
                        variant="borderless"
                        style={{ width: 140, fontWeight: 600 }}
                        onChange={(val) => handleStatusChange(record.id, val)}
                        options={[
                            { 
                                value: 'NOT_CONFIRMED', 
                                label: (record.paymentMethod?.toUpperCase() === 'BANK' && record.paymentStatus?.toUpperCase() === 'UNPAID')
                                    ? t('status_awaiting_payment')
                                    : t('status_order_received')
                            },
                            { 
                                value: 'CONFIRMED', 
                                label: (record.paymentMethod?.toUpperCase() === 'BANK' && record.paymentStatus?.toUpperCase() === 'UNPAID')
                                    ? t('status_awaiting_payment')
                                    : t('status_shipping')
                            },
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
                        <Search
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
                            onSearch={(v) => setQuery({ search: v?.trim() || null, page: 1 })}
                            className="admin-toolbar-search"
                        />
                        <div className="admin-filter-group">
                            <FilterOutlined style={{ color: '#94a3b8', fontSize: '16px' }} />
                            <Select 
                                value={status} 
                                onChange={(val) => setQuery({ status: val, page: 1 })} 
                                className="admin-toolbar-select"
                                placeholder={t('status')}
                                style={{ minWidth: 140 }}
                            >
                                <Option value="ALL">{t('all')}</Option>
                                <Option value="NOT_CONFIRMED">{t('status_order_received')}</Option>
                                <Option value="CONFIRMED">{t('status_shipping')}</Option>
                                <Option value="SUCCEEDED">{t('order_status_SUCCEEDED')}</Option>
                                <Option value="CANCELLED">{t('order_status_CANCELLED')}</Option>
                            </Select>

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
                                placeholder={[t('startDate'), t('endDate')]}
                            />
                        </div>
                    </div>

                    <div className="admin-toolbar-right">
                        <div className="admin-filter-group">
                            <SortAscendingOutlined style={{ color: '#94a3b8', fontSize: '16px' }} />
                            <Select 
                                value={sort} 
                                onChange={(val) => setQuery({ sort: val, page: 1 })} 
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
