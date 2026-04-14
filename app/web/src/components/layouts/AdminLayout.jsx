import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { useLanguage } from '@/store/LanguageContext';
import { ErrorBoundary } from '@/components/common';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import CommandPalette from '@/components/admin/CommandPalette';
import { ADMIN_NAV_ITEMS } from '@/constants/navigation';
import '@/components/layouts/AdminLayout.css';

const { Content } = Layout;

const AdminLayout = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useLanguage();
    const navItems = ADMIN_NAV_ITEMS(t);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <Layout className="admin-layout-container">
            <AdminHeader onSearchOpen={() => setIsSearchOpen(true)} />
            
            <AdminSidebar items={navItems} />

            <Layout className="site-layout">
                <Content className="site-layout-background admin-content">
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </Content>
            </Layout>

            <CommandPalette 
                open={isSearchOpen}
                onCancel={() => setIsSearchOpen(false)}
                items={navItems}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
        </Layout>
    );
};

export default AdminLayout;
