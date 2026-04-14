import React from 'react';
import { Avatar, Dropdown } from 'antd';
import { SearchOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { useLanguage } from '@/store/LanguageContext';
import { LanguageToggle } from '@/components/common';
import logo_image from '@/assets/images/logo.svg';

const AdminHeader = ({ onSearchOpen }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t } = useLanguage();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenuItems = [
        { key: 'home', icon: <HomeOutlined />, label: t('home_page'), onClick: () => { navigate('/'); window.location.reload(); } },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: t('logout'), onClick: handleLogout, danger: true },
    ];

    return (
        <div className='admin-header'>
            <div className='admin-header-left'>
                <div className='admin-logo-wrapper' onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
                    <img src={logo_image} alt='BKEUTY' className='admin-sider-logo' />
                </div>
            </div>

            <div className='admin-header-center'>
                <div className='admin-search-trigger' onClick={onSearchOpen}>
                    <span className='search-text'>
                        <SearchOutlined style={{ marginRight: '8px' }} />
                        {t('admin_search_command')}
                    </span>
                    <span className='kbd'>Ctrl K</span>
                </div>
            </div>

            <div className='admin-header-right'>
                <LanguageToggle className='lang-btn' />
                <Dropdown
                    menu={{ items: userMenuItems }}
                    placement='bottomRight'
                    trigger={['click']}
                    className='admin-user-dropdown'
                >
                    <div className='admin-user-profile'>
                        <Avatar size={28} style={{ backgroundColor: 'var(--admin-primary)' }}>
                            {user?.name?.[0]?.toUpperCase() || 'A'}
                        </Avatar>
                        <span className='admin-username'>{user?.name || 'Admin'}</span>
                    </div>
                </Dropdown>
            </div>
        </div>
    );
};

export default AdminHeader;
