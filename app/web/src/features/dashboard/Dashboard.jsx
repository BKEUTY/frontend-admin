import React, { useMemo, useState } from 'react';
import { Row, Col, Table, Tag, Typography, Space, Segmented, Skeleton, Modal, Avatar } from 'antd';
import { useLanguage } from '@/store/LanguageContext';
import { useNotification } from '@/store/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
    TransactionOutlined,
    ShoppingOutlined,
    AppstoreOutlined,
    CalendarOutlined,
    ArrowUpOutlined,
    DownloadOutlined,
    ExportOutlined,
    UserAddOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
// import * as XLSX from 'xlsx'; // Lazy loaded in exportToExcel
import './Dashboard.css';
import '@/admin-list.css';
import StatsCard from '@/components/common/StatsCard';
import { PageWrapper, CButton, Pagination } from '@/components/common';
import { useDashboard } from '@/hooks/useDashboard';
import { generateSlug } from '@/utils/helpers';
import adminDashboardService from '@/services/adminDashboardService';

const { Text, Title } = Typography;

const Dashboard = () => {
    const { t, language } = useLanguage();
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const navigate = useNavigate();
    const showNotification = useNotification();
    const { timeRange, setTimeRange, loading, dashboardData } = useDashboard('month');
    const [exportLoading, setExportLoading] = useState(false);
    
    const [detailModal, setDetailModal] = useState({ 
        visible: false, 
        type: '', 
        data: [], 
        loading: false,
        currentPage: 1,
        pageSize: 10
    });

    const fetchDetails = async (type) => {
        setDetailModal(prev => ({ 
            ...prev, 
            visible: true, 
            type, 
            loading: true, 
            data: [],
            currentPage: 1 
        }));
        try {
            const end = new Date();
            const start = new Date();
            if (timeRange === 'week') start.setDate(end.getDate() - 7);
            else if (timeRange === 'month') start.setMonth(end.getMonth() - 1);
            else if (timeRange === 'quarter') start.setMonth(end.getMonth() - 3);
            else if (timeRange === 'year') start.setFullYear(end.getFullYear() - 1);
            
            const formatDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const params = { startDate: formatDate(start), endDate: formatDate(end) };

            let listData = [];
            if (type === 'orders') {
                const response = await adminDashboardService.getDetailedOrders(params);
                listData = response?.data || [];
            } else if (type === 'products') {
                const response = await adminDashboardService.getDetailedProducts(params);
                listData = (response?.data?.topProducts || []).map(p => ({
                    ...p,
                    key: p.id,
                    name: p.name,
                    value: p.quantity
                }));
            } else if (type === 'customers') {
                const response = await adminDashboardService.getDetailedCustomers(params);
                listData = response?.data || [];
            } else if (type === 'new-customers') {
                const response = await adminDashboardService.getDetailedNewUsers(params);
                listData = response?.data || [];
            }

            setDetailModal(prev => ({ ...prev, loading: false, data: listData }));
        } catch (err) {
            setDetailModal(prev => ({ ...prev, loading: false, data: [] }));
        }
    };

    const exportToExcel = async (listData, type) => {
        if (!dashboardData) return;
        setExportLoading(true);
        
        setTimeout(async () => {
            try {
                const XLSX = await import('xlsx');
                const wb = XLSX.utils.book_new();
                
                const overview = dashboardData.overview || {};
                const overviewData = [
                    { [t('admin_col_metric')]: t('admin_dashboard_sales'), [t('admin_col_value')]: overview.totalRevenue ?? 0, [t('admin_col_unit')]: t('admin_unit_vnd') },
                    { [t('admin_col_metric')]: t('admin_dashboard_orders'), [t('admin_col_value')]: overview.totalOrders ?? 0, [t('admin_col_unit')]: t('admin_unit_order') },
                    { [t('admin_col_metric')]: t('admin_dashboard_profit'), [t('admin_col_value')]: overview.totalProfit ?? 0, [t('admin_col_unit')]: t('admin_unit_vnd') },
                    { [t('admin_col_metric')]: t('admin_dashboard_products'), [t('admin_col_value')]: overview.totalProductsSold ?? 0, [t('admin_col_unit')]: t('admin_unit_product') },
                ];
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(overviewData), t('admin_sheet_overview'));

                if (listData?.length > 0) {
                    let formattedData = [];
                    const sheetName = t('admin_sheet_daily_detail');

                    if (type === 'orders') {
                        formattedData = listData.map(item => ({
                            [t('admin_order_id')]: `#${item.id}`,
                            [t('admin_date')]: item.date,
                            [t('admin_customer')]: item.customerName,
                            [t('grand_total')]: (item.total || 0) + (item.shippingFee || 0),
                            [t('status')]: item.status
                        }));
                    } else if (type === 'products') {
                        formattedData = listData.map(item => ({
                            [t('admin_product_id')]: item.id,
                            [t('admin_product_name')]: item.name,
                            [t('admin_product_sold')]: item.quantity,
                            [t('revenue')]: item.revenue,
                            [t('admin_dashboard_profit')]: item.profit ?? 0
                        }));
                    } else if (type === 'customers') {
                        formattedData = listData.map(item => ({
                            [t('admin_user_id')]: item.userId,
                            [t('admin_customer')]: item.userName,
                            [t('admin_dashboard_orders')]: item.orderCount,
                            [t('total')]: item.totalSpent
                        }));
                    } else if (type === 'new-customers') {
                        formattedData = listData.map(item => ({
                            [t('admin_user_id')]: item.userId,
                            [t('full_name')]: `${item.firstname || ''} ${item.lastname || ''}`,
                            [t('admin_user_email')]: item.email,
                            [t('admin_user_role')]: item.userRole,
                            [t('admin_date')]: item.createdAt ? new Date(item.createdAt).toLocaleDateString(locale) : '-'
                        }));
                    }
                    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formattedData), sheetName);
                }

                if (dashboardData.revenueChart?.length) {
                    const dailyData = dashboardData.revenueChart.map(d => ({
                        [t('admin_date')]: d.date,
                        [t('admin_dashboard_revenue')]: d.revenue ?? 0,
                        [t('admin_dashboard_orders')]: d.orders ?? 0
                    }));
                    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dailyData), t('admin_sheet_daily_summary'));
                }

                const timeRangeLabels = {
                    'week': t('admin_report_7_days'),
                    'month': t('admin_report_1_month'),
                    'quarter': t('admin_report_3_months'),
                    'year': t('admin_report_1_year')
                };
                const rangeLabel = timeRangeLabels[timeRange] || t('admin_report_1_month');
                const fileName = `Bkeuty_Dashboard_${rangeLabel}_${new Date().getTime()}.xlsx`.replace(/\s+/g, '_');
                XLSX.writeFile(wb, fileName);
                showNotification(t('admin_export_success'), 'success');
            } catch (err) {
                console.error("Excel Export Error:", err);
                showNotification(t('admin_export_failed'), 'error');
            } finally {
                setExportLoading(false);
            }
        }, 500);
    };

    const stats = useMemo(() => {
        const overview = dashboardData?.overview;
        return [
            {
                title: t('admin_dashboard_sales'),
                value: (overview?.totalRevenue ?? 0).toLocaleString(locale) + t('admin_unit_vnd'),
                icon: <TransactionOutlined />,
                trend: 12.5,
                trendType: 'up',
                onClick: () => fetchDetails('orders')
            },
            {
                title: t('admin_dashboard_users'),
                value: (overview?.totalRegisteredCustomers ?? 0).toLocaleString(locale),
                icon: <UserAddOutlined />,
                trend: 15.2,
                trendType: 'up',
                onClick: () => fetchDetails('new-customers')
            },
            {
                title: t('admin_dashboard_orders'),
                value: (overview?.totalOrders ?? 0).toLocaleString(locale),
                icon: <ShoppingOutlined />,
                trend: 8.2,
                trendType: 'up',
                onClick: () => fetchDetails('orders')
            },
            {
                title: t('admin_dashboard_products'),
                value: (overview?.totalProductsSold ?? 0).toLocaleString(locale),
                icon: <AppstoreOutlined />,
                trend: 2.1,
                trendType: 'up',
                onClick: () => fetchDetails('products')
            }
        ];
    }, [t, dashboardData, language]);

    const revenueData = useMemo(() => {
        return dashboardData?.revenueChart?.map(c => ({
            name: c.date ? c.date.substring(5).replace('-', '/') : '',
            revenue: c.revenue ?? 0,
            profit: c.profit ?? 0,
            orders: c.orders ?? 0
        })) ?? [];
    }, [dashboardData]);

    const topProductsData = useMemo(() => {
        return dashboardData?.topPerformers?.topProducts?.slice(0, 5).map(p => ({
            key: p.id,
            name: p.name,
            value: Number(p.quantity ?? 0),
            revenue: p.revenue ?? 0
        })) ?? [];
    }, [dashboardData]);

    const topProductsColumns = [
        { 
            title: t('admin_product_name'), 
            dataIndex: 'name', 
            key: 'name', 
            width: '35%',
            ellipsis: true,
            render: (text, record) => {
                const slug = generateSlug(text, record.key);
                return (
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/products/${slug}`, { state: { productId: record.key } });
                        }} 
                        className="admin-table-link admin-text-primary" 
                        style={{ 
                            fontWeight: 'bold', 
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {text}
                    </button>
                );
            } 
        },
        { 
            title: t('revenue'), 
            dataIndex: 'revenue', 
            key: 'revenue', 
            width: 140,
            align: 'right',
            render: (price) => <Text className="price-cell" style={{ whiteSpace: 'nowrap' }}>{(price ?? 0).toLocaleString(locale)}{t('admin_unit_vnd')}</Text> 
        },
        { 
            title: t('admin_product_sold'), 
            dataIndex: 'value', 
            key: 'value', 
            width: 100,
            align: 'right', 
            render: (sold) => (
                <div className="sold-badge" style={{ display: 'inline-flex', marginLeft: 'auto' }}>
                    <ArrowUpOutlined style={{ marginRight: 4, fontSize: 10 }} />
                    {sold ?? 0}
                </div>
            )
        }
    ];

    const topBrandsData = useMemo(() => {
        return dashboardData?.topPerformers?.topBrands?.slice(0, 5).map(b => ({
            name: b.name,
            value: Number(b.quantity ?? 0),
        })) ?? [];
    }, [dashboardData]);

    const topCustomersData = useMemo(() => {
        return dashboardData?.topCustomers?.slice(0, 3).map(c => ({
            name: c.userName ?? t('not_available'),
            spent: Number(c.totalSpent ?? 0)
        })) ?? [];
    }, [dashboardData, t]);

    const COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', '#10b981'];

    const recentOrdersColumns = [
        { 
            title: t('admin_order_id'), 
            dataIndex: 'id', 
            key: 'id', 
            width: 90,
            render: (text) => (
                <button 
                    type="button"
                    className="admin-table-link"
                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders/${text}`); }} 
                    style={{ 
                        fontWeight: 'bold',
                        color: 'inherit'
                    }}
                >
                    {`#${text}`}
                </button>
            )
        },
        { 
            title: t('admin_customer'), 
            dataIndex: 'customerName', 
            key: 'customerName', 
            width: '25%',
            ellipsis: true,
            render: (text) => <span style={{ whiteSpace: 'nowrap' }}>{text}</span> 
        },
        { 
            title: t('admin_date'), 
            dataIndex: 'date', 
            key: 'date',
            width: 120,
            render: (date) => <span style={{ whiteSpace: 'nowrap' }}>{date ? new Date(date).toLocaleDateString(locale) : '---'}</span>
        },
        { 
            title: t('grand_total'), 
            key: 'total', 
            width: 150,
            align: 'right',
            render: (_, record) => {
                const grandTotal = (record.total || 0) + (record.shippingFee || 0);
                return <Text className="price-cell" style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{grandTotal.toLocaleString(locale)}{t('admin_unit_vnd')}</Text>;
            }
        },
        { 
            title: t('status'), 
            dataIndex: 'status', 
            key: 'status', 
            width: 120,
            align: 'center',
            render: (status) => {
                const map = {
                   'NOT_CONFIRMED': { class: 'warning', text: t('order_status_NOT_CONFIRMED') },
                   '0': { class: 'warning', text: t('order_status_NOT_CONFIRMED') },
                   'CONFIRMED': { class: 'info', text: t('order_status_CONFIRMED') },
                   '1': { class: 'info', text: t('order_status_CONFIRMED') },
                   'SUCCEEDED': { class: 'success', text: t('order_status_SUCCEEDED') },
                   '2': { class: 'success', text: t('order_status_SUCCEEDED') },
                   'CANCELLED': { class: 'danger', text: t('order_status_CANCELLED') },
                   '3': { class: 'danger', text: t('order_status_CANCELLED') }
                };
                const normalizedStatus = status ? String(status).toUpperCase() : '';
                const formatted = map[normalizedStatus] ?? {
                    class: 'default',
                    text: status ? String(status) : '---'
                };
                return <span className={`admin-status-badge ${formatted.class}`} style={{ whiteSpace: 'nowrap', minWidth: '80px' }}>{formatted.text}</span>;
            } 
        },
    ];

    const recentOrders = useMemo(() => {
        return dashboardData?.recentOrders?.slice(0, 5).map(o => ({
            ...o,
            key: o.id,
        })) ?? [];
    }, [dashboardData]);

    return (
        <div className="admin-dashboard-root">
            <PageWrapper
                title={t('admin_dashboard_overview')}
                extra={
                    <Space size="middle">
                        <Segmented
                            size="large"
                            options={[
                                { label: t('admin_report_7_days'), value: 'week' },
                                { label: t('admin_report_1_month'), value: 'month' },
                                { label: t('admin_report_3_months'), value: 'quarter' },
                                { label: t('admin_report_1_year'), value: 'year' }
                            ]}
                            value={timeRange}
                            onChange={setTimeRange}
                            className="admin-segmented-luxury"
                        />
                        <CButton type="primary" icon={<CalendarOutlined />} onClick={() => navigate('/admin/reports')}>
                            {t('admin_home_reports_title')}
                        </CButton>
                    </Space>
                }
            >
                {loading ? (
                    <div className="admin-dashboard-container css-fade-in">
                        <Row gutter={[24, 24]}>
                            {[1, 2, 3, 4].map((k) => (
                                <Col xs={24} sm={12} xl={6} key={`skeleton-stat-${k}`}>
                                    <div className="admin-glass-card" style={{ padding: 24, borderRadius: 16 }}>
                                        <Skeleton active avatar={{ shape: 'square' }} title={false} paragraph={{ rows: 2 }} />
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ) : (
                    <div className="admin-dashboard-container">
                        <Row gutter={[24, 24]}>
                            {stats.map((stat, index) => (
                                <Col xs={24} sm={12} xl={6} key={index}>
                                    {stat.onClick ? (
                                        <button 
                                            type="button"
                                            onClick={stat.onClick} 
                                            className="admin-stats-card-button"
                                            style={{ 
                                                cursor: 'pointer', 
                                                height: '100%',
                                                width: '100%',
                                                padding: 0,
                                                border: 'none',
                                                background: 'none',
                                                textAlign: 'inherit',
                                                display: 'block'
                                            }}
                                            aria-label={stat.title}
                                        >
                                            <StatsCard {...stat} />
                                        </button>
                                    ) : (
                                        <div style={{ height: '100%' }}>
                                            <StatsCard {...stat} />
                                        </div>
                                    )}
                                </Col>
                            ))}

                            <Col xs={24} xl={12} style={{ display: 'flex' }}>
                                <div className="admin-glass-card main-chart-card" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <div className="card-header">
                                        <Title level={5}>{t('admin_dashboard_revenue_chart')}</Title>
                                        <div className="admin-badge-dot">
                                            <span className="dot" style={{ background: '#8b5cf6' }}></span> {t('admin_dashboard_revenue')}
                                        </div>
                                    </div>
                                    <div className="chart-body" style={{ flex: 1 }}>
                                        <ResponsiveContainer width="100%" height={320} style={{ fontFamily: 'var(--font-main, Inter, sans-serif)' }}>
                                            <AreaChart data={revenueData}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                                                <Area type="monotone" dataKey="revenue" name={t('admin_dashboard_revenue')} stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1500} />
                                                <Area type="monotone" dataKey="profit" name={t('admin_dashboard_profit')} stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" animationDuration={1500} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={24} lg={12} xl={6} style={{ display: 'flex' }}>
                                <div className="admin-glass-card" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <div className="card-header" onClick={() => fetchDetails('customers')} style={{ cursor: 'pointer' }}>
                                        <Title level={5}>{t('admin_dashboard_top_customers')}</Title>
                                        <ExportOutlined className="admin-text-muted" />
                                    </div>
                                    <div className="chart-body" style={{ flex: 1 }}>
                                        <ResponsiveContainer width="100%" height={320} style={{ fontFamily: 'var(--font-main, Inter, sans-serif)' }}>
                                            <BarChart data={topCustomersData}>
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                <YAxis hide />
                                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                                <Bar dataKey="spent" name={t('amount_spent')} fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={24} lg={12} xl={6} style={{ display: 'flex' }}>
                                <div className="admin-glass-card" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <div className="card-header">
                                        <Title level={5}>{t('admin_best_brand')}</Title>
                                    </div>
                                    <div className="chart-body flex-center" style={{ flex: 1 }}>
                                        <ResponsiveContainer width="100%" height={320} style={{ fontFamily: 'var(--font-main, Inter, sans-serif)' }}>
                                            <PieChart>
                                                <Pie data={topBrandsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                                                    {(topBrandsData ?? []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend layout="horizontal" verticalAlign="bottom" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={24} lg={12} xl={12} style={{ display: 'flex' }}>
                                <div className="admin-glass-card" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <div className="card-header">
                                        <Title level={5}>{t('admin_recent_orders')}</Title>
                                    </div>
                                    <Table
                                        columns={recentOrdersColumns}
                                        dataSource={recentOrders}
                                        pagination={false}
                                        className="admin-compact-table"
                                        size="small"
                                        scroll={{ x: 'max-content' }}
                                        onRow={(record) => ({
                                            onClick: () => navigate(`/admin/orders/${record.id}`),
                                            className: "admin-table-row-pointer"
                                        })}
                                    />
                                </div>
                            </Col>

                            <Col xs={24} lg={12} xl={12} style={{ display: 'flex' }}>
                                <div className="admin-glass-card" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <div className="card-header">
                                        <Title level={5}>{t('admin_best_product')}</Title>
                                    </div>
                                    <Table
                                        columns={topProductsColumns}
                                        dataSource={topProductsData}
                                        pagination={false}
                                        className="admin-compact-table"
                                        size="small"
                                        scroll={{ x: 'max-content' }}
                                        onRow={(record) => ({
                                            onClick: () => {
                                                const slug = generateSlug(record.name, record.key);
                                                navigate(`/admin/products/${slug}`, {
                                                    state: { productId: record.key }
                                                });
                                            },
                                            className: "admin-table-row-pointer"
                                        })}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </PageWrapper>

            <Modal
                title={<Title level={4}>{t('view_all')}</Title>}
                open={detailModal.visible}
                onCancel={() => setDetailModal(prev => ({ ...prev, visible: false }))}
                width={1000}
                footer={[
                    <div key="footer-actions" className="admin-modal-footer-actions">
                        <CButton 
                            className="admin-btn-export" 
                            icon={<DownloadOutlined />} 
                            onClick={() => exportToExcel(detailModal.data, detailModal.type)}
                            loading={exportLoading}
                            disabled={exportLoading}
                        >
                            {t('admin_export_excel')}
                        </CButton>
                        <CButton 
                            className="admin-btn-close" 
                            onClick={() => setDetailModal(prev => ({ ...prev, visible: false }))}
                        >
                            {t('close')}
                        </CButton>
                    </div>
                ]}
                className="admin-glass-modal"
            >
                <div style={{ marginTop: 24 }}>
                    <Table 
                        dataSource={(detailModal?.data ?? [])
                            .slice(
                                (detailModal.currentPage - 1) * detailModal.pageSize, 
                                detailModal.currentPage * detailModal.pageSize
                            )} 
                        rowKey={(record) => record.id || record.userId || record.key}
                        loading={detailModal.loading}
                        className="admin-compact-table"
                        columns={
                            detailModal.type === 'orders' ? recentOrdersColumns : 
                            detailModal.type === 'products' ? [
                                ...topProductsColumns,
                                { title: t('admin_col_quantity'), dataIndex: 'quantity', key: 'quantity', width: 100, align: 'right' }
                            ] :
                            detailModal.type === 'new-customers' ? [
                                { 
                                    title: t('admin_user_id'), 
                                    dataIndex: 'userId', 
                                    key: 'userId', 
                                    width: 90, 
                                    align: 'center', 
                                    render: id => {
                                        if (!id) return '-';
                                        const strId = String(id);
                                        return <span className="admin-table-id">#{strId.length > 8 ? strId.substring(0, 8) : strId}</span>;
                                    }
                                },
                                { 
                                    title: t('full_name'), 
                                    key: 'fullName', 
                                    width: 220,
                                    render: (_, record) => (
                                        <Space>
                                            <Avatar size="small" icon={<UserOutlined />} />
                                            <Text strong>{`${record.firstname || ''} ${record.lastname || ''}`}</Text>
                                        </Space>
                                    )
                                },
                                { title: t('admin_user_email'), dataIndex: 'email', key: 'email', width: 220, ellipsis: true },
                                { 
                                    title: t('admin_user_role'), 
                                    dataIndex: 'userRole', 
                                    key: 'userRole', 
                                    width: 120, 
                                    align: 'center',
                                    render: (role) => (
                                        <Tag color={role?.toLowerCase() === 'admin' ? 'gold' : 'blue'} className="admin-status-badge">
                                            {role?.toLowerCase() === 'admin' ? t('admin_user_role_admin') : t('admin_user_role_user')}
                                        </Tag>
                                    )
                                }
                            ] :
                            [
                                { 
                                    title: t('admin_user_id'), 
                                    dataIndex: 'userId', 
                                    key: 'userId', 
                                    width: 90, 
                                    align: 'center', 
                                    render: id => {
                                        if (!id) return '-';
                                        const strId = String(id);
                                        return <span className="admin-table-id">#{strId.length > 8 ? strId.substring(0, 8) : strId}</span>;
                                    }
                                },
                                { 
                                    title: t('admin_customer'), 
                                    key: 'customer', 
                                    width: 220,
                                    render: (_, record) => (
                                        <Space>
                                            <Avatar size="small" icon={<UserOutlined />} />
                                            <Text strong>{record.userName}</Text>
                                        </Space>
                                    )
                                }, 
                                { title: t('admin_dashboard_orders'), dataIndex: 'orderCount', key: 'orderCount', width: 120, align: 'right', render: v => <Text strong>{v}</Text> },
                                { title: t('grand_total'), dataIndex: 'totalSpent', key: 'totalSpent', width: 160, align: 'right', render: v => <Text strong className="admin-current-price">{Number(v ?? 0).toLocaleString(locale)}{t('admin_unit_vnd')}</Text> }
                            ]
                        }
                        pagination={false}
                        scroll={{ y: 450 }}
                    />
                    
                    {detailModal.data?.length > 0 && !detailModal.loading && (
                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                page={detailModal.currentPage}
                                pageSize={detailModal.pageSize}
                                totalItems={detailModal.data.length}
                                totalPages={Math.ceil(detailModal.data.length / detailModal.pageSize)}
                                onPageChange={(page) => setDetailModal(prev => ({ ...prev, currentPage: page }))}
                            />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
