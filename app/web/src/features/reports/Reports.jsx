import React, { useState, useMemo } from 'react';
import { Row, Col, Typography, Space, Segmented, Table, Tag, DatePicker } from 'antd';
import { useLanguage } from '@/store/LanguageContext';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    Legend,
    ComposedChart
} from 'recharts';
import { PageWrapper, CButton } from '@/components/common';
import { DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import './Reports.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Reports = () => {
    const { t } = useLanguage();
    const [timeRange, setTimeRange] = useState('month');

    const revenueHistory = useMemo(() => [
        { date: '01/06', revenue: 1200000, profit: 400000 },
        { date: '05/06', revenue: 1800000, profit: 600000 },
        { date: '10/06', revenue: 1500000, profit: 500000 },
        { date: '15/06', revenue: 2400000, profit: 800000 },
        { date: '20/06', revenue: 2100000, profit: 700000 },
        { date: '25/06', revenue: 3200000, profit: 1100000 },
        { date: '30/06', revenue: 2800000, profit: 950000 },
    ], []);

    const orderStatusData = useMemo(() => [
        { status: t('status_completed'), count: 850, fill: '#10b981' },
        { status: t('status_pending'), count: 120, fill: '#f59e0b' },
        { status: t('status_in_progress'), count: 210, fill: '#3b82f6' },
        { status: t('status_cancelled'), count: 45, fill: '#ef4444' },
    ], [t]);

    const brandPerformance = useMemo(() => [
        { brand: 'L\'Oréal', sales: 450, growth: 15 },
        { brand: 'La Roche-Posay', sales: 380, growth: 22 },
        { brand: 'Vichy', sales: 320, growth: 8 },
        { brand: 'Innisfree', sales: 290, growth: -5 },
        { brand: 'Laneige', sales: 240, growth: 12 },
    ], []);

    const sourceData = useMemo(() => [
        { name: t('admin_dashboard_traffic_direct'), value: 400 },
        { name: t('admin_dashboard_traffic_social'), value: 300 },
        { name: t('admin_dashboard_traffic_search'), value: 200 },
        { name: t('admin_dashboard_traffic_email'), value: 100 },
    ], [t]);

    return (
        <div className="admin-reports-page">
            <PageWrapper
                title={t('admin_home_reports_title')}
                extra={
                    <Space size="middle" wrap>
                        <RangePicker className="admin-datepicker-luxury" />
                        <Segmented
                            options={[
                                { label: `7 ${t('days')}`, value: 'week' },
                                { label: `30 ${t('days')}`, value: 'month' },
                                { label: `90 ${t('days')}`, value: 'quarter' }
                            ]}
                            value={timeRange}
                            onChange={setTimeRange}
                            className="admin-segmented-luxury"
                        />
                        <CButton type="secondary" icon={<DownloadOutlined />}>
                            {t('admin_export_excel')}
                        </CButton>
                    </Space>
                }
            >
                <div className="admin-dashboard-container">
                    <Row gutter={[24, 24]}>
                        <Col xs={24}>
                            <div className="admin-glass-card">
                                <div className="card-header">
                                    <Title level={5}>{t('admin_revenue_profit')}</Title>
                                    <CButton type="text" icon={<FilterOutlined />}>{t('admin_filter_deep')}</CButton>
                                </div>
                                <div className="chart-body">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <ComposedChart data={revenueHistory}>
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                            <Legend verticalAlign="top" height={36} />
                                            <Bar dataKey="revenue" name={t('admin_dashboard_revenue')} fill="#c13584" radius={[6, 6, 0, 0]} barSize={40} />
                                            <Line type="monotone" dataKey="profit" name={t('admin_dashboard_profit')} stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} lg={14}>
                            <div className="admin-glass-card">
                                <div className="card-header">
                                    <Title level={5}>{t('admin_order_status_analysis')}</Title>
                                </div>
                                <div className="chart-body">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={orderStatusData} layout="vertical" margin={{ left: 40 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="status" axisLine={false} tickLine={false} tick={{ fill: '#1e293b', fontWeight: 600, fontSize: 13 }} />
                                            <Tooltip cursor={{ fill: '#f8fafc' }} />
                                            <Bar dataKey="count" name={t('admin_dashboard_orders_count')} radius={[0, 8, 8, 0]} barSize={32}>
                                                {orderStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} lg={10}>
                            <div className="admin-glass-card">
                                <div className="card-header">
                                    <Title level={5}>{t('admin_traffic_source')}</Title>
                                </div>
                                <div className="chart-body flex-center">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={sourceData}
                                                innerRadius={70}
                                                outerRadius={100}
                                                paddingAngle={8}
                                                dataKey="value"
                                            >
                                                {sourceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#c13584', '#1e293b', '#3b82f6', '#94a3b8'][index % 4]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Col>

                        <Col xs={24}>
                            <div className="admin-glass-card">
                                <div className="card-header">
                                    <Title level={5}>{t('admin_brand_performance')}</Title>
                                </div>
                                <Table
                                    dataSource={brandPerformance}
                                    pagination={false}
                                    className="admin-compact-table"
                                    columns={[
                                        { title: t('admin_product_brand'), dataIndex: 'brand', key: 'brand', render: (val) => <Text strong>{val || t('not_available')}</Text> },
                                        { title: t('admin_product_sold'), dataIndex: 'sales', key: 'sales', render: (val) => <Text>{val || 0} {t('product_items').toLowerCase()}</Text> },
                                        { 
                                            title: t('revenue'), 
                                            dataIndex: 'growth', 
                                            key: 'growth',
                                            render: (val) => (
                                                <Tag color={val > 0 ? 'success' : 'error'} style={{ fontWeight: 700, borderRadius: '6px' }}>
                                                    {val > 0 ? '+' : ''}{val}%
                                                </Tag>
                                            ) 
                                        }
                                    ]}
                                    rowKey="brand"
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
            </PageWrapper>
        </div>
    );
};

export default Reports;
