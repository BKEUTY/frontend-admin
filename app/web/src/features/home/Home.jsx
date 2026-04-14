import React from 'react';
import { Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/LanguageContext';
import {
    ControlOutlined,
    ShoppingOutlined,
    FileTextOutlined,
    HeartOutlined,
    ScheduleOutlined,
    UsergroupAddOutlined,
    PieChartOutlined,
    ArrowRightOutlined,
    TagsOutlined,
    AppstoreOutlined,
    TagOutlined
} from '@ant-design/icons';
import './Home.css';

const AdminHome = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const apps = [
        {
            key: 'dashboard',
            title: t('admin_home_dashboard_title'),
            desc: t('admin_home_dashboard_desc'),
            icon: <ControlOutlined />
        },
        {
            key: 'orders',
            title: t('admin_home_orders_title'),
            desc: t('admin_home_orders_desc'),
            icon: <FileTextOutlined />
        },
        {
            key: 'products',
            title: t('admin_home_products_title'),
            desc: t('admin_home_products_desc'),
            icon: <ShoppingOutlined />
        },
        {
            key: 'categories',
            title: t('admin_home_categories_title'),
            desc: t('admin_home_categories_desc'),
            icon: <AppstoreOutlined />
        },
        {
            key: 'brands',
            title: t('admin_home_brands_title'),
            desc: t('admin_home_brands_desc'),
            icon: <TagsOutlined />
        },
        {
            key: 'promotions',
            title: t('admin_home_promotions_title'),
            desc: t('admin_home_promotions_desc'),
            icon: <TagOutlined />
        },
        {
            key: 'services',
            title: t('admin_home_services_title'),
            desc: t('admin_home_services_desc'),
            icon: <HeartOutlined />
        },
        {
            key: 'appointments',
            title: t('admin_home_appointments_title'),
            desc: t('admin_home_appointments_desc'),
            icon: <ScheduleOutlined />
        },
        {
            key: 'staff',
            title: t('admin_home_staff_title'),
            desc: t('admin_home_staff_desc'),
            icon: <UsergroupAddOutlined />
        },
        {
            key: 'reports',
            title: t('admin_home_reports_title'),
            desc: t('admin_home_reports_desc'),
            icon: <PieChartOutlined />
        }
    ];

    return (
        <div className="admin-home-grid">
            <div className="admin-home-header">
                <h1>{t('admin_home_welcome')}</h1>
                <p>{t('admin_home_subtitle')}</p>
            </div>

            <Row gutter={[32, 32]}>
                {apps.map((app) => (
                    <Col xs={24} sm={12} md={8} xl={6} key={app.key}>
                        <div className="app-card" onClick={() => navigate(`/admin/${app.key}`)}>
                            <div className="app-icon-wrapper">
                                {app.icon}
                            </div>
                            <div className="app-info">
                                <h3>{app.title}</h3>
                                <p>{app.desc}</p>
                            </div>
                            <div className="app-arrow">
                                <ArrowRightOutlined />
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default AdminHome;
