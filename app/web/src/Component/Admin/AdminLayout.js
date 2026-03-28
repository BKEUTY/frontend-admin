import React, { useState } from 'react';
import { Layout, Avatar, Dropdown, Modal, Input } from 'antd';
import {
    ControlOutlined,
    UsergroupAddOutlined,
    HeartOutlined,
    ShoppingOutlined,
    FileTextOutlined,
    ScheduleOutlined,
    PieChartOutlined,
    LogoutOutlined,
    HomeOutlined,
    ArrowRightOutlined,
    SearchOutlined,
    TagOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import logo_image from '../../Assets/Images/logo.svg';
import { useLanguage } from '../../i18n/LanguageContext';
import LanguageToggle from '../Common/LanguageToggle';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import './Admin.css';

const { Header, Content } = Layout;

const AdminLayout = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { t } = useLanguage();

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    React.useEffect(() => {
        const handleResize = () => {
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenuItems = [
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: t('home_page'),
            onClick: () => {
                navigate('/');
                window.location.reload();
            },
        },
        { type: 'divider' },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: t('logout'),
            onClick: handleLogout,
            danger: true,
        },
    ];

    const items = [
        {
            key: '/admin/dashboard',
            icon: <ControlOutlined />,
            label: t('dashboard'),
            desc: t('admin_home_dashboard_desc')
        },
        {
            key: '/admin/orders',
            icon: <FileTextOutlined />,
            label: t('orders'),
            desc: t('admin_home_orders_desc')
        },
        {
            key: '/admin/products',
            icon: <ShoppingOutlined />,
            label: t('products'),
            desc: t('admin_home_products_desc')
        },
        {
            key: '/admin/promotions',
            icon: <TagOutlined />,
            label: t('promotions'),
            desc: t('admin_home_promotions_desc')
        },
        {
            key: '/admin/services',
            icon: <HeartOutlined />,
            label: t('services'),
            desc: t('admin_home_services_desc')
        },
        {
            key: '/admin/appointments',
            icon: <ScheduleOutlined />,
            label: t('appointments'),
            desc: t('admin_home_appointments_desc')
        },
        {
            key: '/admin/staff',
            icon: <UsergroupAddOutlined />,
            label: t('staff'),
            desc: t('admin_home_staff_desc')
        },
        {
            key: '/admin/reports',
            icon: <PieChartOutlined />,
            label: t('reports'),
            desc: t('admin_home_reports_desc')
        },
    ];

    const filteredItems = items.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Layout className="admin-layout-container">

            <Header className="admin-header">
                <div className="admin-header-left">
                    <div className="admin-logo-wrapper" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
                        <img src={logo_image} alt="BKEUTY" className="admin-sider-logo" />
                    </div>
                </div>

                <div className="admin-header-center">
                    <div
                        className="admin-search-trigger"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <span className="search-text">
                            <SearchOutlined style={{ marginRight: '8px' }} />
                            {t('admin_search_command')}
                        </span>
                        <span className="kbd">Ctrl K</span>
                    </div>
                </div>

                <div className="admin-header-right">
                    <LanguageToggle className="lang-btn" />
                    <Dropdown
                        menu={{ items: userMenuItems }}
                        placement="bottomRight"
                        trigger={['click']}
                        classNames={{ root: 'admin-user-dropdown' }}
                    >
                        <div className="admin-user-profile">
                            <Avatar size={28} style={{ backgroundColor: 'var(--admin-primary)' }}>
                                {user?.name?.[0]?.toUpperCase() || 'A'}
                            </Avatar>
                            <span className="admin-username">{user?.name || 'Admin'}</span>
                        </div>
                    </Dropdown>
                </div>
            </Header>

            <div className="admin-floating-dock">
                {items.map(item => (
                    <div
                        key={item.key}
                        className={`dock-item ${location.pathname === item.key ? 'active' : ''}`}
                        onClick={() => navigate(item.key)}
                    >
                        {item.icon}
                        <span className="dock-tooltip">{item.label}</span>
                    </div>
                ))}
            </div>


            <Layout className="site-layout">
                <Content className="site-layout-background admin-content">
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </Content>
            </Layout>


            <Modal
                open={isSearchOpen}
                onCancel={() => setIsSearchOpen(false)}
                footer={null}
                closable={false}
                width={600}
                className="command-palette-modal"
                centered
            >
                <div className="command-search-header">
                    <SearchOutlined style={{ fontSize: '20px', color: 'var(--admin-primary)' }} />
                    <Input
                        placeholder={t('admin_search_placeholder')}
                        variant="borderless"
                        className="command-search-input"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="command-results">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <div
                                key={item.key}
                                className="command-item"
                                onClick={() => {
                                    navigate(item.key);
                                    setIsSearchOpen(false);
                                    setSearchQuery('');
                                }}
                            >
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'rgba(193, 53, 132, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--admin-primary)'
                                }}>
                                    {item.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4>{item.label}</h4>
                                    <p>{item.desc}</p>
                                </div>
                                <ArrowRightOutlined style={{ opacity: 0.3 }} />
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                            {t('admin_no_results')} "{searchQuery}"
                        </div>
                    )}
                </div>
                <div className="command-footer">
                    <span><span className="kbd">↵</span> {t('admin_select_hint')}</span>
                    <span><span className="kbd">esc</span> {t('admin_close_hint')}</span>
                </div>
            </Modal>
        </Layout>
    );
};

export default AdminLayout;
