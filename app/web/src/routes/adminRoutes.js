import React, { lazy } from 'react';

const Dashboard = lazy(() => import('../Component/Admin/Dashboard/Dashboard'));
const ProductList = lazy(() => import('../Component/Admin/Products/ProductList'));
const ProductCreate = lazy(() => import('../Component/Admin/Products/ProductCreate'));
const AdminProductDetail = lazy(() => import('../Component/Admin/Products/AdminProductDetail'));
const OrderList = lazy(() => import('../Component/Admin/Orders/OrderList'));
const AdminOrderDetail = lazy(() => import('../Component/Admin/Orders/AdminOrderDetail'));
const AdminHome = lazy(() => import('../Component/Admin/AdminHome'));
const PromotionList = lazy(() => import('../Component/Admin/Promotions/PromotionList'));
const PromotionCreate = lazy(() => import('../Component/Admin/Promotions/PromotionCreate'));

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
        path: "promotions",
        element: <PromotionList />
    },
    {
        path: "promotions/create",
        element: <PromotionCreate />
    },
    {
        path: "promotions/edit/:id",
        element: <PromotionCreate />
    },
    {
        path: "orders",
        element: <OrderList />
    },
    {
        path: "orders/:id",
        element: <AdminOrderDetail />
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
