import React, { lazy } from 'react';

const Dashboard = lazy(() => import('../Component/Admin/Dashboard/Dashboard'));
const ProductList = lazy(() => import('../Component/Admin/Products/ProductList'));
const ProductCreate = lazy(() => import('../Component/Admin/Products/ProductCreate'));
const AdminProductDetail = lazy(() => import('../Component/Admin/Products/AdminProductDetail'));
const OrderList = lazy(() => import('../Component/Admin/Orders/OrderList'));
const AdminHome = lazy(() => import('../Component/Admin/AdminHome'));
const DevelopingState = lazy(() => import('../Component/Common/DevelopingState'));

export const adminRoutes = [
    {
        index: true,
        element: <AdminHome />
    },
    {
        path: "dashboard",
        element: <Dashboard />
    },
    {
        path: "products",
        element: <ProductList />
    },
    {
        path: "products/create",
        element: <ProductCreate />
    },
    {
        path: "products/:slug",
        element: <AdminProductDetail />
    },
    {
        path: "orders",
        element: <OrderList />
    },
    {
        path: "services",
        element: <DevelopingState title="Services Management" />
    },
    {
        path: "appointments",
        element: <DevelopingState title="Appointments Management" />
    },
    {
        path: "staff",
        element: <DevelopingState title="Staff Management" />
    },
    {
        path: "reports",
        element: <DevelopingState title="Reports & Analytics" />
    }
];
