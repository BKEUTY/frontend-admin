import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Table, Tag, Spin, Typography, Space, Segmented } from 'antd';
import { useLanguage } from '@/store/LanguageContext';
import {
    TransactionOutlined,
    ShoppingOutlined,
    UserOutlined,
    ArrowUpOutlined,
    CalendarOutlined,
    AppstoreOutlined
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
import './Dashboard.css';
import StatsCard from '@/components/common/StatsCard';
import { PageWrapper, CButton } from '@/components/common';

const { Text, Title } = Typography;

const Dashboard = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const stats = useMemo(() => [
        {
            title: t('admin_dashboard_sales'),
            value: (45680000).toLocaleString('vi-VN') + 'đ',
            icon: <TransactionOutlined />,
            trend: 12.5,
            trendType: 'up'
        },
        {
            title: t('admin_dashboard_orders'),
            value: (1248).toLocaleString('vi-VN'),
            icon: <ShoppingOutlined />,
            trend: 8.2,
            trendType: 'up'
        },
        {
            title: t('admin_dashboard_users'),
            value: (3842).toLocaleString('vi-VN'),
            icon: <UserOutlined />,
            trend: 5.6,
            trendType: 'up'
        },
        {
            title: t('admin_dashboard_products'),
            value: '124',
            icon: <AppstoreOutlined />,
            trend: 2.1,
            trendType: 'down'
        }
    ], [t]);

    const revenueData = useMemo(() => [
        { name: t('mon'), revenue: 4500000, orders: 120 },
        { name: t('tue'), revenue: 5200000, orders: 145 },
        { name: t('wed'), revenue: 3800000, orders: 98 },
        { name: t('thu'), revenue: 6100000, orders: 180 },
        { name: t('fri'), revenue: 5800000, orders: 165 },
        { name: t('sat'), revenue: 8500000, orders: 250 },
        { name: t('sun'), revenue: 7800000, orders: 210 },
    ], [t]);

    const categoryData = useMemo(() => [
        { name: t('skincare'), value: 45 },
        { name: t('makeup'), value: 25 },
        { name: t('fragrance'), value: 15 },
        { name: t('body_care'), value: 10 },
        { name: t('hair_care'), value: 5 },
    ], [t]);

    const userGrowthData = useMemo(() => [
        { month: 'Jan', users: 1200 },
        { month: 'Feb', users: 1500 },
        { month: 'Mar', users: 1800 },
        { month: 'Apr', users: 2400 },
        { month: 'May', users: 2800 },
        { month: 'Jun', users: 3842 },
    ], []);

    const COLORS = ['#c13584', '#e1306c', '#fd1d1d', '#f56040', '#f77737'];

    const productsColumns = [
        {
            title: t('admin_product_name'),
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong className="admin-text-primary">{text}</Text>,
        },
        {
            title: t('admin_product_category'),
            dataIndex: 'category',
            key: 'category',
            render: (tag) => (
                <Tag className={`category-tag-${tag.toLowerCase()}`}>
                    {t(tag.toLowerCase())}
                </Tag>
            ),
        },
        {
            title: t('admin_product_price'),
            dataIndex: 'price',
            key: 'price',
            render: (price) => <Text className="price-cell">{price.toLocaleString()} -æ</Text>,
        },
        {
            title: t('admin_product_sold'),
            dataIndex: 'sold',
            key: 'sold',
            align: 'center',
            render: (sold) => (
                <div className="sold-badge">
                    <ArrowUpOutlined style={{ marginRight: 4, fontSize: 10 }} />
                    {sold}
                </div>
            ),
        },
    ];

    const products = [
        { key: '1', name: 'Premium Anti-Aging Serum', category: 'skincare', price: 1250000, sold: 482 },
        { key: '2', name: 'Velvet Matte Lipstick Red', category: 'makeup', price: 480000, sold: 325 },
        { key: '3', name: 'Hydrating Rose Toner', category: 'toner', price: 350000, sold: 298 },
        { key: '4', name: 'Glow Boost Vitamin C', category: 'skincare', price: 890000, sold: 245 },
        { key: '5', name: 'Ocean Mist Body Spray', category: 'fragrance', price: 650000, sold: 186 },
    ];

    return (
        <div className="admin-dashboard-root">
            <PageWrapper
                title={t('admin_dashboard_overview')}
                extra={
                    <Space size="middle">
                        <Segmented
                            options={[
                                { label: t('this_week'), value: 'week' },
                                { label: t('admin_this_month'), value: 'month' },
                                { label: t('admin_this_year'), value: 'year' }
                            ]}
                            value={timeRange}
                            onChange={setTimeRange}
                            className="admin-segmented-luxury"
                        />
                        <CButton type="primary" icon={<CalendarOutlined />}>
                            {t('admin_home_reports_title')}
                        </CButton>
                    </Space>
                }
            >
                {loading ? (
                    <div className="admin-loading-container">
                        <Spin size="large" />
                    </div>
                ) : (
                    <div className="admin-dashboard-container">
                        <Row gutter={[24, 24]}>
                            {stats.map((stat, index) => (
                                <Col xs={24} sm={12} xl={6} key={index}>
                                    <StatsCard {...stat} />
                                </Col>
                            ))}

                            <Col xs={24} xl={16}>
                                <div className="admin-glass-card main-chart-card">
                                    <div className="card-header">
                                        <Title level={5}>{t('revenue_overview')}</Title>
                                        <div className="card-actions">
                                            <BadgeDot color="#c13584" text={t('admin_dashboard_revenue')} />
                                            <BadgeDot color="#f56040" text={t('admin_dashboard_orders_count')} />
                                        </div>
                                    </div>
                                    <div className="chart-body">
                                        <ResponsiveContainer width="100%" height={350}>
                                            <AreaChart data={revenueData}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#c13584" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#c13584" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="revenue" 
                                                    name={t('admin_dashboard_revenue')}
                                                    stroke="#c13584" 
                                                    strokeWidth={3} 
                                                    fillOpacity={1} 
                                                    fill="url(#colorRevenue)" 
                                                    animationDuration={1500}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="orders" 
                                                    name={t('admin_dashboard_orders_count')}
                                                    stroke="#f56040" 
                                                    strokeWidth={2} 
                                                    fill="transparent"
                                                    strokeDasharray="5 5"
                                                    animationDuration={2000}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={24} xl={8}>
                                <div className="admin-glass-card">
                                    <div className="card-header">
                                        <Title level={5}>{t('categories')}</Title>
                                    </div>
                                    <div className="chart-body flex-center">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={categoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {categoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={24} lg={12}>
                                <div className="admin-glass-card">
                                    <div className="card-header">
                                        <Title level={5}>{t('admin_top_products')}</Title>
                                    </div>
                                    <Table
                                        columns={productsColumns}
                                        dataSource={products}
                                        pagination={false}
                                        className="admin-compact-table"
                                        size="small"
                                    />
                                </div>
                            </Col>

                            <Col xs={24} lg={12}>
                                <div className="admin-glass-card">
                                    <div className="card-header">
                                        <Title level={5}>{t('admin_dashboard_users')}</Title>
                                    </div>
                                    <div className="chart-body">
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={userGrowthData}>
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                <YAxis hide />
                                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                                <Bar dataKey="users" name={t('admin_dashboard_users')} fill="#1e293b" radius={[4, 4, 0, 0]} barSize={30} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                        <div className="stat-summary-mini">
                                            <div className="summary-item">
                                                <span className="summary-label">{t('admin_dashboard_summary_mobile')}</span>
                                                <span className="summary-value">65%</span>
                                            </div>
                                            <div className="summary-item">
                                                <span className="summary-label">{t('admin_dashboard_summary_new_users')}</span>
                                                <span className="summary-value">+240</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </PageWrapper>
        </div>
    );
};

const BadgeDot = ({ color, text }) => (
    <div className="admin-badge-dot">
        <span className="dot" style={{ backgroundColor: color }}></span>
        <span className="dot-text">{text}</span>
    </div>
);

export default Dashboard;
