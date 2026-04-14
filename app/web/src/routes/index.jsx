import { createBrowserRouter, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import AdminLayout from '@/components/layouts/AdminLayout';
import { authRoutes, errorRoutes } from './authRoutes';
import { adminRoutes } from './adminRoutes';
import { Skeleton } from '@/components/common';

export { authRoutes, errorRoutes } from './authRoutes';
export { adminRoutes } from './adminRoutes';

const router = createBrowserRouter([
    ...authRoutes,
    
    {
        path: '/admin',
        element: (
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        ),
        children: adminRoutes
    },
    
    {
        path: '/',
        element: <Navigate to="/admin" replace />
    },
    
    ...errorRoutes
]);

export default router;
