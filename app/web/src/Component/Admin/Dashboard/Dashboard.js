import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Tag, Spin, Typography } from 'antd';
import { useLanguage } from '../../../i18n/LanguageContext';
import adminApi from '../../../api/adminApi';
import {
    TransactionOutlined,
    ShoppingOutlined,
    UserOutlined,
    ScheduleOutlined
} from '@ant-design/icons';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import './Dashboard.css';
import StatsCard from '../Common/StatsCard';
import { PageWrapper } from '../../Common';

const { Text } = Typography;

const Dashboard = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState({
        products: 0,
        users: 0,
        orders: 0,
        revenue: '0 đ'
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await adminApi.getStats();
                setStatsData({
                    ...data,
                    revenue: '40,689,000 đ' 
                });
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const stats = [
        {
            title: t('admin_dashboard_sales'),
            value: statsData.revenue,
            icon: <TransactionOutlined />,
            trend: 8.5,
            trendType: 'up'
        },
        {
            title: t('admin_dashboard_orders'),
            value: statsData.orders.toLocaleString(),
            icon: <ShoppingOutlined />,
            trend: 5.2,
            trendType: 'up'
        },
        {
            title: t('admin_dashboard_users'),
            value: statsData.users.toLocaleString(),
            icon: <UserOutlined />,
            trend: 12,
            trendType: 'up'
        },
        {
            title: t('admin_dashboard_products'),
            value: statsData.products.toLocaleString(),
            icon: <ScheduleOutlined />,
            trend: 3.4,
            trendType: 'up'
        }
    ];

    const chartData = [
        { name: t('mon'), value: 15 },
        { name: t('tue'), value: 22 },
        { name: t('wed'), value: 10 },
        { name: t('thu'), value: 25 },
        { name: t('fri'), value: 18 },
        { name: t('sat'), value: 30 },
        { name: t('sun'), value: 28 },
    ];

    const columns = [
        {
            title: t('admin_product_name'),
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text className="product-name-cell">{text}</Text>,
        },
        {
            title: t('admin_product_category'),
            dataIndex: 'category',
            key: 'category',
            render: (tag) => (
                <Tag className="category-tag-modern">
                    {t(tag.toLowerCase())}
                </Tag>
            ),
        },
        {
            title: t('admin_product_price'),
            dataIndex: 'price',
            key: 'price',
            render: (price) => <Text className="price-cell">{price}</Text>,
        },
        {
            title: t('admin_product_sold'),
            dataIndex: 'sold',
            key: 'sold',
            align: 'right',
            render: (sold) => <span className="sold-count-badge">{sold}</span>,
        },
    ];

    const products = [
        { key: '1', name: 'Anti-Aging Cream', category: 'skincare', price: '1,200,000 đ', sold: 342 },
        { key: '2', name: 'Matte Lipstick', category: 'makeup', price: '450,000 đ', sold: 215 },
        { key: '3', name: 'Vitamin C Serum', category: 'skincare', price: '890,000 đ', sold: 189 },
        { key: '4', name: 'Rose Water Toner', category: 'toner', price: '320,000 đ', sold: 156 },
    ];

    return (
        <div className="dashboard-content">
            <PageWrapper title={t('dashboard')} noCard>
                {loading ? (
                    <div className="dashboard-loading-wrap">
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} lg={16}>
                                <div className="beauty-card chart-card">
                                    <div className="chart-header">
                                        <span className="chart-title">{t('revenue_overview')}</span>
                                    </div>
                                    <div className="chart-container">
                                        <ResponsiveContainer width="100%" height={380}>
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--admin-primary)" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="var(--admin-primary)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                                <Area type="monotone" dataKey="value" stroke="var(--admin-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={24} lg={8}>
                                <div className="stat-cards-container">
                                    {stats.map((stat, index) => (
                                        <StatsCard key={index} {...stat} />
                                    ))}
                                </div>
                            </Col>
                        </Row>

                        <div className="table-card beauty-card">
                            <div className="chart-header">
                                <span className="chart-title">{t('admin_top_products')}</span>
                            </div>
                            <Table
                                columns={columns}
                                dataSource={products}
                                pagination={false}
                                className="admin-modern-table"
                                scroll={{ x: 'max-content' }}
                            />
                        </div>
                    </>
                )}
            </PageWrapper>
        </div>
    );
};

export default Dashboard;
