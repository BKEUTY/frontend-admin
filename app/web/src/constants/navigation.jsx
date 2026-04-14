import React from 'react';
import {
    HomeOutlined,
    ControlOutlined, UsergroupAddOutlined, HeartOutlined,
    ShoppingOutlined, FileTextOutlined, ScheduleOutlined,
    PieChartOutlined, AppstoreOutlined,
    TagsOutlined, TagOutlined
} from '@ant-design/icons';

export const ADMIN_NAV_ITEMS = (t) => [
    { key: '/admin/dashboard', icon: <ControlOutlined />, label: t('dashboard'), desc: t('admin_home_dashboard_desc') },
    { key: '/admin/orders', icon: <FileTextOutlined />, label: t('orders'), desc: t('admin_home_orders_desc') },
    { key: '/admin/products', icon: <ShoppingOutlined />, label: t('products'), desc: t('admin_home_products_desc') },
    { key: '/admin/categories', icon: <AppstoreOutlined />, label: t('categories'), desc: t('admin_home_categories_desc') },
    { key: '/admin/brands', icon: <TagsOutlined />, label: t('brands'), desc: t('admin_home_brands_desc') },
    { key: '/admin/promotions', icon: <TagOutlined />, label: t('promotions'), desc: t('admin_home_promotions_desc') },
    { key: '/admin/services', icon: <HeartOutlined />, label: t('services'), desc: t('admin_home_services_desc') },
    { key: '/admin/appointments', icon: <ScheduleOutlined />, label: t('appointments'), desc: t('admin_home_appointments_desc') },
    { key: '/admin/users', icon: <UsergroupAddOutlined />, label: t('admin_dashboard_users'), desc: t('admin_home_users_desc') },
    { key: '/admin/reports', icon: <PieChartOutlined />, label: t('reports'), desc: t('admin_home_reports_desc') },
];
