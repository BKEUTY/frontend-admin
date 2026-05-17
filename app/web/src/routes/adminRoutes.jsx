import React, { lazy } from 'react';

const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const DevelopingState = lazy(() => import('@/components/common/DevelopingState'));

const OrderList = lazy(() => import('@/features/orders/OrderList'));
const AdminOrderDetail = lazy(() => import('@/features/orders/AdminOrderDetail'));

const ProductList = lazy(() => import('@/features/products/ProductList'));
const ProductCreate = lazy(() => import('@/features/products/ProductCreate'));
const AdminProductDetail = lazy(() => import('@/features/products/AdminProductDetail'));

const AdminHome = lazy(() => import('@/features/home/Home'));
const PromotionList = lazy(() => import('@/features/promotions/PromotionList'));
const PromotionCreate = lazy(() => import('@/features/promotions/PromotionCreate'));
const BrandList = lazy(() => import('@/features/brands/BrandList'));
const CategoryList = lazy(() => import('@/features/categories/CategoryList'));
const UserList = lazy(() => import('@/features/users/UserList'));
const Reports = lazy(() => import('@/features/reports/Reports'));
const AdminReviewList = lazy(() => import('@/features/reviews/AdminReviewList'));

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
        path: "orders",
        element: <OrderList />
    },
    {
        path: "orders/:id",
        element: <AdminOrderDetail />
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
        path: "categories",
        element: <CategoryList />
    },
    {
        path: "brands",
        element: <BrandList />
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
        path: "users",
        element: <UserList />
    },
    {
        path: "promotions/edit/:id",
        element: <PromotionCreate />
    },
    {
        path: "reviews",
        element: <AdminReviewList />
    },
    {
        path: "services",
        element: <DevelopingState titleKey="services_management" />
    },
    {
        path: "appointments",
        element: <DevelopingState titleKey="appointments_management" />
    },
    {
        path: "staff",
        element: <DevelopingState titleKey="staff_management" />
    },
    {
        path: "reports",
        element: <Reports />
    }
];
