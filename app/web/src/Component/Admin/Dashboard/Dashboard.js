import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Tag, Spin } from 'antd';
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
                    revenue: '40,689,000 đ' // Mock revenue for now
                });
            } catch (error) {
                console.error("Dashboard stats error", error);
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
            render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
        },
        {
            title: t('admin_product_category'),
            dataIndex: 'category',
            key: 'category',
            render: (tag) => (
                <Tag color="magenta" style={{ borderRadius: '6px', border: 'none', fontWeight: 600, padding: '2px 10px' }}>
                    {t(tag.toLowerCase()).toUpperCase()}
                </Tag>
            ),
        },
        {
            title: t('admin_product_price'),
            dataIndex: 'price',
            key: 'price',
            render: (price) => <span style={{ color: '#1f2937' }}>{price}</span>,
        },
        {
            title: t('admin_product_sold'),
            dataIndex: 'sold',
            key: 'sold',
            align: 'right',
            render: (sold) => <span style={{ fontWeight: 700, color: 'var(--admin-primary)' }}>{sold}</span>,
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
            <div className="dashboard-header admin-page-header">
                <h2 className="dashboard-title">{t('dashboard')}</h2>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
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
                                <div className="chart-container" style={{ marginLeft: -20, marginTop: 20 }}>
                                    <ResponsiveContainer width="100%" height={380}>
                                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--admin-primary)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--admin-primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="var(--admin-primary)"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorValue)"
                                            />
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
        </div>
    );
};

export default Dashboard;
