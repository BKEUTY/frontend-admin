import React, { lazy } from 'react';

const Dashboard = lazy(() => import('../pages/Admin/Dashboard/Dashboard'));
const DevelopingState = lazy(() => import('../Component/Common/DevelopingState'));
const ProductList = lazy(() => import('../pages/Admin/Products/ProductList'));
const ProductCreate = lazy(() => import('../pages/Admin/Products/ProductCreate'));
const AdminProductDetail = lazy(() => import('../pages/Admin/Products/AdminProductDetail'));
const OrderList = lazy(() => import('../pages/Admin/Orders/OrderList'));
const AdminOrderDetail = lazy(() => import('../pages/Admin/Orders/AdminOrderDetail'));
const AdminHome = lazy(() => import('../pages/Admin/Home/Home'));
const PromotionList = lazy(() => import('../pages/Admin/Promotions/PromotionList'));
const PromotionCreate = lazy(() => import('../pages/Admin/Promotions/PromotionCreate'));

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
