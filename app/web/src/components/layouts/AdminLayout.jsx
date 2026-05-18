import React, { useState, useEffect, Suspense } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { useLanguage } from '@/store/LanguageContext';
import { ErrorBoundary, ScrollToTop } from '@/components/common';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { ADMIN_NAV_ITEMS } from '@/constants/navigation';
import { safeLazy } from '@/utils/safeLazy';
import '@/components/layouts/AdminLayout.css';

const CommandPalette = safeLazy(() => import('@/components/admin/CommandPalette'));

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
            <ScrollToTop />
            <AdminHeader onSearchOpen={() => setIsSearchOpen(true)} />
            
            <AdminSidebar items={navItems} />

            <Layout className="site-layout">
                <Content className="site-layout-background admin-content">
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </Content>
            </Layout>

            {isSearchOpen && (
                <Suspense fallback={null}>
                    <CommandPalette 
                        open={isSearchOpen}
                        onCancel={() => setIsSearchOpen(false)}
                        items={navItems}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                </Suspense>
            )}
        </Layout>
    );
};

export default AdminLayout;
