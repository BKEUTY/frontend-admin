import React from 'react';
import { safeLazy } from '@/utils/safeLazy';

const Dashboard = safeLazy(() => import('@/features/dashboard/Dashboard'));
const DevelopingState = safeLazy(() => import('@/components/common/DevelopingState'));

const OrderList = safeLazy(() => import('@/features/orders/OrderList'));
const AdminOrderDetail = safeLazy(() => import('@/features/orders/AdminOrderDetail'));

const ProductList = safeLazy(() => import('@/features/products/ProductList'));
const ProductCreate = safeLazy(() => import('@/features/products/ProductCreate'));
const AdminProductDetail = safeLazy(() => import('@/features/products/AdminProductDetail'));

const AdminHome = safeLazy(() => import('@/features/home/Home'));
const PromotionList = safeLazy(() => import('@/features/promotions/PromotionList'));
const PromotionCreate = safeLazy(() => import('@/features/promotions/PromotionCreate'));
const BrandList = safeLazy(() => import('@/features/brands/BrandList'));
const CategoryList = safeLazy(() => import('@/features/categories/CategoryList'));
const UserList = safeLazy(() => import('@/features/users/UserList'));
const Reports = safeLazy(() => import('@/features/reports/Reports'));
const AdminReviewList = safeLazy(() => import('@/features/reviews/AdminReviewList'));

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
