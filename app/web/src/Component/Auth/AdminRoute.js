import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user_role } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user_role !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminRoute;
