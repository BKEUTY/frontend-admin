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

    const sections = [
        {
            id: 'analytics',
            label: t('admin_section_insights'),
            items: [
                { key: 'dashboard', title: t('admin_home_dashboard_title'), desc: t('admin_home_dashboard_desc'), icon: <ControlOutlined />, color: '#6366f1' },
                { key: 'reports', title: t('admin_home_reports_title'), desc: t('admin_home_reports_desc'), icon: <PieChartOutlined />, color: '#f59e0b' },
            ]
        },
        {
            id: 'catalog',
            label: t('admin_section_catalog'),
            items: [
                { key: 'products', title: t('admin_home_products_title'), desc: t('admin_home_products_desc'), icon: <ShoppingOutlined />, color: '#ec4899' },
                { key: 'categories', title: t('admin_home_categories_title'), desc: t('admin_home_categories_desc'), icon: <AppstoreOutlined />, color: '#06b6d4' },
                { key: 'brands', title: t('admin_home_brands_title'), desc: t('admin_home_brands_desc'), icon: <TagsOutlined />, color: '#8b5cf6' },
                { key: 'promotions', title: t('admin_home_promotions_title'), desc: t('admin_home_promotions_desc'), icon: <TagOutlined />, color: '#ef4444' },
            ]
        },
        {
            id: 'operations',
            label: t('admin_section_operations'),
            items: [
                { key: 'orders', title: t('admin_home_orders_title'), desc: t('admin_home_orders_desc'), icon: <FileTextOutlined />, color: '#10b981' },
                { key: 'users', title: t('admin_home_users_title'), desc: t('admin_home_users_desc'), icon: <UsergroupAddOutlined />, color: '#3b82f6' },
                { key: 'appointments', title: t('admin_home_appointments_title'), desc: t('admin_home_appointments_desc'), icon: <ScheduleOutlined />, color: '#f43f5e' },
                { key: 'services', title: t('admin_home_services_title'), desc: t('admin_home_services_desc'), icon: <HeartOutlined />, color: '#6366f1' },
            ]
        }
    ];

    return (
        <div className="admin-home-container">
            <div className="admin-home-header">
                <h1>
                    {t('admin_home_welcome_prefix')}{' '}
                    <span className="title-highlight">{t('admin_home_welcome_highlight')}</span>
                    {t('admin_home_welcome_suffix')}
                </h1>
                <p>{t('admin_home_subtitle')}</p>
            </div>

            <div className="admin-sections-wrap">
                {sections.map(section => (
                    <div className="admin-section" key={section.id}>
                        <h2 className="section-title">{section.label}</h2>
                        <Row gutter={[20, 20]}>
                            {section.items.map((app) => (
                                <Col xs={24} sm={12} md={8} xl={6} key={app.key}>
                                    <div className="app-card-outer">
                                        <button 
                                            type="button" 
                                            className="app-card-v2" 
                                            onClick={() => navigate(`/admin/${app.key}`)}
                                        >
                                            <div className="app-card-glow" style={{ backgroundColor: app.color }}></div>
                                            <div className="app-icon-box" style={{ '--icon-color': app.color }}>
                                                {app.icon}
                                            </div>
                                            <div className="app-content">
                                                <h3>{app.title}</h3>
                                                <p>{app.desc}</p>
                                            </div>
                                            <div className="app-action">
                                                <span>{t('admin_open_module')}</span>
                                                <ArrowRightOutlined />
                                            </div>
                                        </button>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ))}
            </div>
            
            <div className="admin-home-footer">
                <p>© 2026 BKEUTY Admin. {t('all_rights_reserved') || 'Tất cả quyền được bảo lưu.'}</p>
            </div>
        </div>
    );
};

export default AdminHome;
