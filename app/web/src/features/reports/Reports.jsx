import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Typography, Space, Segmented, Card, Skeleton, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/store/LanguageContext';
import { useNotification } from '@/store/NotificationContext';
import { DownloadOutlined, PieChartOutlined, BarChartOutlined, LineChartOutlined, UserOutlined, RocketOutlined } from '@ant-design/icons';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, Legend } from 'recharts';
import './Reports.css';
import { PageWrapper, CButton, StatsCard } from '@/components/common';
import adminReportService from '@/services/adminReportService';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', '#10b981'];

const ReportBarChart = ({ data, t }) => {
    if (!data || data.length === 0) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
            <div style={{ fontSize: '48px', opacity: 0.2 }}>📊</div>
            <Text style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>{t('admin_report_no_data')}</Text>
        </div>
    );
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} barSize={40}>
                    {(data || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

const Reports = () => {
    const { t, language } = useLanguage();
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const [searchParams, setSearchParams] = useSearchParams();
    const showNotification = useNotification();
    
    const reportType = searchParams.get('type') || 'combined';
    const timeRange = searchParams.get('range') || 'month';
    
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [dates, setDates] = useState(null);

    const setReportType = (val) => setSearchParams({ type: val, range: timeRange });
    const setTimeRange = (val) => setSearchParams({ type: reportType, range: val });

    const getDateRange = useCallback(() => {
        let start, end;
        if (dates && dates[0] && dates[1]) {
            start = dates[0].toDate();
            end = dates[1].toDate();
        } else {
            end = new Date();
            start = new Date();
            if (timeRange === 'week') start.setDate(end.getDate() - 7);
            else if (timeRange === 'month') start.setMonth(end.getMonth() - 1);
            else if (timeRange === 'quarter') start.setMonth(end.getMonth() - 3);
            else if (timeRange === 'year') start.setFullYear(end.getFullYear() - 1);
        }
        const formatDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return { start, end, startStr: formatDate(start), endStr: formatDate(end) };
    }, [dates, timeRange]);

    useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            try {
                const { startStr, endStr } = getDateRange();
                const params = { startDate: startStr, endDate: endStr };
                
                const response = await adminReportService.getReportData(params);
                setReportData(response.data);
            } catch (err) {
                console.error('Failed to fetch report data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [reportType, timeRange, dates]);

    const chartData = useMemo(() => {
        return reportData?.revenueChart?.map(c => ({
            name: c.date ? dayjs(c.date).format('MM/DD') : '',
            revenue: Number(c.revenue ?? 0),
            shippingFee: Number(c.shippingFee ?? 0),
            profit: Number(c.profit ?? 0),
            orders: Number(c.orders ?? 0)
        })) ?? [];
    }, [reportData]);

    const exportToExcel = () => {
        if (!reportData) return;
        setExportLoading(true);

        setTimeout(async () => {
            try {
                const XLSX = await import('xlsx');
                const wb = XLSX.utils.book_new();
                
                const { start, end, startStr, endStr } = getDateRange();

                const reportTypeLabels = {
                    combined: t('admin_report_combined_revenue'),
                    product: t('admin_report_product_revenue'),
                    brand: t('admin_report_brand_revenue'),
                    category: t('admin_report_category_revenue')
                };
                const localizedType = reportTypeLabels[reportType] || reportType;
                const fileName = `Bkeuty_Report_${localizedType}_${startStr}_${t('to') || 'To'}_${endStr}.xlsx`.replace(/\s+/g, '_');

                const appendSummaryRows = (ws, data, numericKeys) => {
                    if (!data || data.length === 0) return ws;
                    const keys = Object.keys(data[0]);
                    const sumRow = {};
                    const avgRow = {};
                    keys.forEach(k => {
                        if (numericKeys.includes(k)) {
                            const vals = data.map(r => Number(r[k] || 0));
                            sumRow[k] = vals.reduce((a, b) => a + b, 0);
                            avgRow[k] = Math.round(sumRow[k] / (data.length || 1));
                        } else if (k === keys[0]) {
                            sumRow[k] = t('admin_total_label');
                            avgRow[k] = t('admin_average_label');
                        } else {
                            sumRow[k] = '';
                            avgRow[k] = '';
                        }
                    });
                    XLSX.utils.sheet_add_json(ws, [sumRow, avgRow], { skipHeader: true, origin: -1 });
                    return ws;
                };

                const mappers = {
                    overview: (ov) => {
                        const safeOv = ov || {};
                        const totalRevenue = Number(safeOv.totalRevenue || 0);
                        const totalOrders = Number(safeOv.totalOrders || 0);
                        return [
                            { [t('admin_col_metric')]: t('admin_report_start_date'), [t('admin_col_value')]: start, [t('admin_col_unit')]: '-' },
                            { [t('admin_col_metric')]: t('admin_report_end_date'), [t('admin_col_value')]: end, [t('admin_col_unit')]: '-' },
                            { [t('admin_col_metric')]: t('admin_total_revenue'), [t('admin_col_value')]: totalRevenue, [t('admin_col_unit')]: t('admin_unit_vnd') },
                            { [t('admin_col_metric')]: t('admin_total_shipping_fee'), [t('admin_col_value')]: Number(safeOv.totalShippingFee || 0), [t('admin_col_unit')]: t('admin_unit_vnd') },
                            { [t('admin_col_metric')]: t('admin_total_orders'), [t('admin_col_value')]: totalOrders, [t('admin_col_unit')]: t('admin_unit_order') },
                            { [t('admin_col_metric')]: t('admin_avg_order_value'), [t('admin_col_value')]: Math.round(totalRevenue / (totalOrders || 1)), [t('admin_col_unit')]: t('admin_unit_vnd') },
                            { [t('admin_col_metric')]: t('admin_total_products_sold'), [t('admin_col_value')]: Number(safeOv.totalProductsSold || 0), [t('admin_col_unit')]: t('admin_unit_product') },
                            { [t('admin_col_metric')]: t('admin_total_new_customers'), [t('admin_col_value')]: Number(safeOv.totalRegisteredCustomers || 0), [t('admin_col_unit')]: t('admin_unit_person') }
                        ];
                    },
                    product: (p) => {
                        if (!p) return {};
                        return {
                            [t('admin_col_product_id')]: p.id || '-',
                            [`${t('admin_product_name')}`]: p.name || '-',
                            [`${t('admin_col_quantity')} (${t('admin_unit_product')})`]: Number(p.quantity || 0),
                            [`${t('admin_col_revenue_vnd')} (${t('admin_unit_vnd')})`]: Number(p.revenue || 0)
                        };
                    },
                    brand: (b) => {
                        if (!b) return {};
                        return {
                            [`${t('admin_product_brand')}`]: b.name || '-',
                            [`${t('admin_col_quantity')} (${t('admin_unit_product')})`]: Number(b.quantity || 0),
                            [`${t('admin_col_revenue_vnd')} (${t('admin_unit_vnd')})`]: Number(b.revenue || 0)
                        };
                    },
                    category: (c) => {
                        if (!c) return {};
                        return {
                            [`${t('admin_product_category')}`]: c.name || '-',
                            [`${t('admin_col_quantity')} (${t('admin_unit_product')})`]: Number(c.quantity || 0),
                            [`${t('admin_col_revenue_vnd')} (${t('admin_unit_vnd')})`]: Number(c.revenue || 0)
                        };
                    },
                    invoiceDetail: (o) => {
                        if (!o) return {};
                        const totalVal = Number(o.total || 0);
                        const shipVal = Number(o.shippingFee || 0);
                        return {
                            [`${t('admin_order_id')}`]: o.id || '-',
                            [`${t('admin_col_time')}`]: o.date ? dayjs(o.date).format('YYYY-MM-DD HH:mm:ss') : '-',
                            [`${t('admin_customer')}`]: o.customerName || '-',
                            [`${t('total')} (${t('admin_unit_vnd')})`]: totalVal,
                            [`${t('admin_col_shipping_fee')} (${t('admin_unit_vnd')})`]: shipVal,
                            [`${t('grand_total')} (${t('admin_unit_vnd')})`]: totalVal + shipVal
                        };
                    },
                    productTransaction: (d) => {
                        if (!d) return {};
                        return {
                            [`${t('admin_col_time')}`]: d.date ? dayjs(d.date).format('YYYY-MM-DD HH:mm:ss') : '-',
                            [`${t('admin_col_product_id')}`]: d.variantId || '-',
                            [`${t('admin_product_name')}`]: d.name || '-',
                            [`${t('admin_col_quantity')} (${t('admin_unit_product')})`]: Number(d.quantity || 0),
                            [`${t('admin_col_original_price')} (${t('admin_unit_vnd')})`]: Number(d.originalPrice || 0),
                            [`${t('admin_col_promotional_price')} (${t('admin_unit_vnd')})`]: Number(d.promotionalPrice || 0),
                            [`${t('admin_col_revenue_vnd')} (${t('admin_unit_vnd')})`]: Number(d.revenue || 0),
                            [`${t('admin_col_profit_vnd')} (${t('admin_unit_vnd')})`]: Number(d.profit || 0)
                        };
                    },
                    brandTransaction: (d) => {
                        if (!d) return {};
                        return {
                            [`${t('admin_col_time')}`]: d.date ? dayjs(d.date).format('YYYY-MM-DD HH:mm:ss') : '-',
                            [`${t('admin_col_brand_id')}`]: d.entityId || '-',
                            [`${t('admin_col_brand_name')}`]: d.entityName || '-',
                            [`${t('admin_col_product_id')}`]: d.productId || '-',
                            [`${t('admin_product_name')}`]: d.productVariantName || '-',
                            [`${t('admin_col_quantity')} (${t('admin_unit_product')})`]: Number(d.quantity || 0),
                            [`${t('admin_col_original_price')} (${t('admin_unit_vnd')})`]: Number(d.originalPrice || 0),
                            [`${t('admin_col_promotional_price')} (${t('admin_unit_vnd')})`]: Number(d.promotionalPrice || 0),
                            [`${t('admin_col_revenue_vnd')} (${t('admin_unit_vnd')})`]: Number(d.revenue || 0),
                            [`${t('admin_col_profit_vnd')} (${t('admin_unit_vnd')})`]: Number(d.profit || 0)
                        };
                    },
                    categoryTransaction: (d) => {
                        if (!d) return {};
                        return {
                            [`${t('admin_col_time')}`]: d.date ? dayjs(d.date).format('YYYY-MM-DD HH:mm:ss') : '-',
                            [`${t('admin_col_category_id')}`]: d.entityId || '-',
                            [`${t('admin_col_category_name')}`]: d.entityName || '-',
                            [`${t('admin_col_product_id')}`]: d.productId || '-',
                            [`${t('admin_product_name')}`]: d.productVariantName || '-',
                            [`${t('admin_col_quantity')} (${t('admin_unit_product')})`]: Number(d.quantity || 0),
                            [`${t('admin_col_original_price')} (${t('admin_unit_vnd')})`]: Number(d.originalPrice || 0),
                            [`${t('admin_col_promotional_price')} (${t('admin_unit_vnd')})`]: Number(d.promotionalPrice || 0),
                            [`${t('admin_col_revenue_vnd')} (${t('admin_unit_vnd')})`]: Number(d.revenue || 0),
                            [`${t('admin_col_profit_vnd')} (${t('admin_unit_vnd')})`]: Number(d.profit || 0)
                        };
                    }
                };

                const sanitizeSheetName = (name) => {
                    if (!name) return 'Sheet';
                    return name.replace(/[\\/?*[\]:]/g, '_').substring(0, 31);
                };

                const buildSheet = (data, numericKeys) => {
                    if (!data || data.length === 0) return XLSX.utils.json_to_sheet([]);
                    const ws = XLSX.utils.json_to_sheet(data);
                    if (numericKeys && numericKeys.length) appendSummaryRows(ws, data, numericKeys);
                    return ws;
                };

                const vnd = t('admin_unit_vnd');
                const colQty = `${t('admin_col_quantity')} (${t('admin_unit_product')})`;
                const colRev = `${t('admin_col_revenue_vnd')} (${vnd})`;
                const colShip = `${t('admin_col_shipping_fee')} (${vnd})`;
                const colProfit = `${t('admin_col_profit_vnd')} (${vnd})`;
                const colOrd = `${t('admin_total_orders')} (${t('admin_unit_order')})`;
                const colAvg = `${t('admin_col_avg_order_value')} (${vnd})`;
                const colSubtotal = `${t('total')} (${vnd})`;
                const colGrandTotal = `${t('grand_total')} (${vnd})`;

                if (reportType === 'combined') {
                    const wsOverview = XLSX.utils.json_to_sheet(mappers.overview(reportData.overview));
                    XLSX.utils.book_append_sheet(wb, wsOverview, sanitizeSheetName(t('admin_sheet_overview')));

                    const productsData = (reportData.topPerformers?.topProducts ?? []).map(mappers.product);
                    XLSX.utils.book_append_sheet(wb, buildSheet(productsData, [colQty, colRev]), sanitizeSheetName(t('admin_sheet_products')));

                    const brandsData = (reportData.topPerformers?.topBrands ?? []).map(mappers.brand);
                    XLSX.utils.book_append_sheet(wb, buildSheet(brandsData, [colQty, colRev]), sanitizeSheetName(t('admin_sheet_brands')));

                    const catsData = (reportData.topPerformers?.topCategories ?? []).map(mappers.category);
                    XLSX.utils.book_append_sheet(wb, buildSheet(catsData, [colQty, colRev]), sanitizeSheetName(t('admin_sheet_categories')));

                    const invoiceData = (reportData.recentOrders ?? []).map(mappers.invoiceDetail);
                    XLSX.utils.book_append_sheet(wb, buildSheet(invoiceData, [colSubtotal, colShip, colGrandTotal]), sanitizeSheetName(t('admin_sheet_daily_summary')));

                    if (reportData.productDetail?.length) {
                        const d = reportData.productDetail.map(mappers.productTransaction);
                        XLSX.utils.book_append_sheet(wb, buildSheet(d, [colQty, colRev, colProfit]), sanitizeSheetName(t('admin_sheet_daily_detail')));
                    }
                    if (reportData.brandDetail?.length) {
                        const d = reportData.brandDetail.map(mappers.brandTransaction);
                        XLSX.utils.book_append_sheet(wb, buildSheet(d, [colQty, colRev, colProfit]), sanitizeSheetName(t('admin_sheet_brand_detail')));
                    }
                    if (reportData.categoryDetail?.length) {
                        const d = reportData.categoryDetail.map(mappers.categoryTransaction);
                        XLSX.utils.book_append_sheet(wb, buildSheet(d, [colQty, colRev, colProfit]), sanitizeSheetName(t('admin_sheet_category_detail')));
                    }

                } else if (reportType === 'product') {
                    const productsData = (reportData.topPerformers?.topProducts ?? []).map(mappers.product);
                    XLSX.utils.book_append_sheet(wb, buildSheet(productsData, [colQty, colRev]), sanitizeSheetName(t('admin_sheet_products')));
                    const detail = (reportData.productDetail ?? []).map(mappers.productTransaction);
                    if (detail.length) XLSX.utils.book_append_sheet(wb, buildSheet(detail, [colQty, colRev, colProfit]), sanitizeSheetName(t('admin_sheet_daily_detail')));

                } else if (reportType === 'brand') {
                    const brandsData = (reportData.topPerformers?.topBrands ?? []).map(mappers.brand);
                    XLSX.utils.book_append_sheet(wb, buildSheet(brandsData, [colQty, colRev]), sanitizeSheetName(t('admin_sheet_brands')));
                    const detail = (reportData.brandDetail ?? []).map(mappers.brandTransaction);
                    if (detail.length) XLSX.utils.book_append_sheet(wb, buildSheet(detail, [colQty, colRev, colProfit]), sanitizeSheetName(t('admin_sheet_brand_detail')));

                } else if (reportType === 'category') {
                    const catsData = (reportData.topPerformers?.topCategories ?? []).map(mappers.category);
                    XLSX.utils.book_append_sheet(wb, buildSheet(catsData, [colQty, colRev]), sanitizeSheetName(t('admin_sheet_categories')));
                    const detail = (reportData.categoryDetail ?? []).map(mappers.categoryTransaction);
                    if (detail.length) XLSX.utils.book_append_sheet(wb, buildSheet(detail, [colQty, colRev, colProfit]), sanitizeSheetName(t('admin_sheet_category_detail')));
                }

                const safeFileName = fileName.replace(/[\\/:*?"<>|]/g, '_');
                XLSX.writeFile(wb, safeFileName, { bookSST: false, cellStyles: true });
                showNotification(t('admin_export_success'), 'success');
            } catch (err) {
                console.error("Excel Export Logic Error:", err);
                showNotification(t('admin_export_data_failed'), 'error');
            } finally {
                setExportLoading(false);
            }
        }, 300);
    };

    const stats = useMemo(() => {
        const overview = reportData?.overview ?? {};
        return [
            { label: t('admin_total_revenue'), value: overview.totalRevenue ?? 0, suffix: t('admin_unit_vnd'), icon: <LineChartOutlined /> },
            { label: t('admin_total_orders'), value: overview.totalOrders ?? 0, icon: <BarChartOutlined /> },
            { label: t('admin_total_products_sold'), value: overview.totalProductsSold ?? 0, icon: <PieChartOutlined /> },
            { label: t('admin_total_new_customers'), value: overview.totalRegisteredCustomers ?? 0, icon: <UserOutlined /> },
        ];
    }, [reportData, t]);

    return (
        <div className="admin-reports-page">
            <PageWrapper title={t('admin_home_reports_title')}>
                <div className="admin-dashboard-container">
                    <Card className="admin-reports-glass-panel" bordered={false} bodyStyle={{ padding: 0 }}>
                        <div className="reports-top-controls-vertical">
                    <div className="control-section-v-row">
                        <div style={{ minWidth: 200 }}>
                            <Text type="secondary" className="section-label-minimal">
                                {t('admin_report_choose_type')}
                            </Text>
                        </div>
                        <div className="report-type-horizontal-row">
                            {['combined', 'product', 'category', 'brand'].map(type => (
                                <button 
                                    type="button"
                                    key={type}
                                    className={`luxury-type-card-v2 ${reportType === type ? 'active' : ''}`}
                                    onClick={() => setReportType(type)}
                                    aria-pressed={reportType === type}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: 'inherit',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    {t(`admin_report_${type}_revenue`)}
                                </button>
                            ))}
                        </div>
                    </div>
                            
                            <div className="horizontal-divider-minimal" />
                            
                    <div className="control-section-v-row">
                        <div style={{ minWidth: 200 }}>
                            <Text type="secondary" className="section-label-minimal">
                                {t('admin_report_time_range')}
                            </Text>
                        </div>
                        <div className="time-controls-horizontal-row">
                            <Segmented
                                options={[
                                    { label: t('admin_report_7_days'), value: 'week' },
                                    { label: t('admin_report_1_month'), value: 'month' },
                                    { label: t('admin_report_3_months'), value: 'quarter' },
                                    { label: t('admin_report_1_year'), value: 'year' }
                                ]}
                                value={timeRange}
                                onChange={setTimeRange}
                                className="segmented-modern-v2"
                            />
                            <RangePicker 
                                format="YYYY-MM-DD"
                                value={dates}
                                onChange={(val) => setDates(val)}
                                className="range-picker-modern-v2"
                                placeholder={[t('admin_report_start_date'), t('admin_report_end_date')]}
                                allowClear
                            />
                        </div>
                    </div>
                        </div>
                        <div className="reports-footer-action-bar">
                            <div className="report-selection-summary">
                                <div className="summary-main">
                                    <Text style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>
                                        {t('admin_home_reports_title')}: 
                                        <span style={{ color: 'var(--admin-primary)', marginLeft: 8, fontWeight: 500 }}>
                                            {t(`admin_report_${reportType}_revenue`)}
                                        </span>
                                    </Text>
                                </div>
                                <div className="summary-sub">
                                    {dates ? (
                                        <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                                            {dates[0].format('DD/MM/YYYY')} - {dates[1].format('DD/MM/YYYY')}
                                        </Text>
                                    ) : (
                                        <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                                            {timeRange === 'week' ? t('admin_report_7_days') : 
                                             timeRange === 'month' ? t('admin_report_1_month') : 
                                             timeRange === 'quarter' ? t('admin_report_3_months') : t('admin_report_1_year')}
                                        </Text>
                                    )}
                                </div>
                            </div>
                            <CButton 
                                type="primary" 
                                icon={<DownloadOutlined />} 
                                onClick={exportToExcel} 
                                className="btn-export-reports-v3"
                                loading={exportLoading}
                                disabled={exportLoading}
                            >
                                {t('admin_export_excel')}
                            </CButton>
                        </div>
                    </Card>

                    <div className="report-stats-grid" style={{ marginTop: '32px' }}>
                        <Row gutter={[24, 24]}>
                            {stats.map((stat, i) => (
                                <Col xs={24} sm={12} md={12} lg={12} xl={6} key={i}>
                                    <StatsCard 
                                        title={stat.label}
                                        value={typeof stat.value === 'number' ? `${stat.value.toLocaleString(locale)}${stat.suffix || ''}` : stat.value}
                                        icon={stat.icon}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </div>

                    <div className="admin-reports-content css-fade-in" style={{ marginTop: '32px' }}>
                        {loading ? <Card className="admin-glass-card"><Skeleton active paragraph={{ rows: 15 }} /></Card> : (
                            <div className="report-charts-container">
                                {reportType === 'combined' ? (
                                    <Space direction="vertical" size={32} style={{ width: '100%' }}>
                                        <Card className="admin-glass-card chart-main-card" title={t('admin_dashboard_revenue_chart')}>
                                            <div style={{ height: 400 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={chartData}>
                                                        <defs>
                                                            <linearGradient id="colorRepRev" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                            </linearGradient>
                                                            <linearGradient id="colorRepShip" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                            </linearGradient>
                                                            <linearGradient id="colorRepProfit" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                                        <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }} />
                                                        <Legend verticalAlign="top" align="right" />
                                                        <Area type="monotone" dataKey="revenue" name={t('revenue')} stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRepRev)" animationDuration={1000} />
                                                        <Area type="monotone" dataKey="shippingFee" name={t('admin_total_shipping_fee')} stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRepShip)" animationDuration={1000} />
                                                        <Area type="monotone" dataKey="profit" name={t('admin_dashboard_profit')} stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRepProfit)" animationDuration={1000} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card>

                                        <Row gutter={[24, 24]}>
                                            <Col xs={24} xl={8}>
                                                <Card className="admin-glass-card chart-mini-card" title={t('admin_report_product_revenue')}>
                                                    <div style={{ height: 300 }}>
                                                        <ReportBarChart data={reportData?.topPerformers?.topProducts} t={t} />
                                                    </div>
                                                </Card>
                                            </Col>
                                            <Col xs={24} xl={8}>
                                                <Card className="admin-glass-card chart-mini-card" title={t('admin_report_category_revenue')}>
                                                    <div style={{ height: 300 }}>
                                                        <ReportBarChart data={reportData?.topPerformers?.topCategories} t={t} />
                                                    </div>
                                                </Card>
                                            </Col>
                                            <Col xs={24} xl={8}>
                                                <Card className="admin-glass-card chart-mini-card" title={t('admin_report_brand_revenue')}>
                                                    <div style={{ height: 300 }}>
                                                        <ReportBarChart data={reportData?.topPerformers?.topBrands} t={t} />
                                                    </div>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Space>
                                ) : (
                                    <Card className="admin-glass-card chart-focus-card" title={t(`admin_report_${reportType}_revenue`)}>
                                        <div style={{ height: 500 }}>
                                            <ReportBarChart 
                                                data={
                                                    reportType === 'product' ? reportData?.topPerformers?.topProducts :
                                                    reportType === 'category' ? reportData?.topPerformers?.topCategories :
                                                    reportData?.topPerformers?.topBrands
                                                } 
                                                t={t}
                                            />
                                        </div>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </PageWrapper>
        </div>
    );
};

export default Reports;
