import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * ProtectedRoute — guards a route based on authentication and optional role.
 *
 * Props:
 *   children       — the element to render if access is granted
 *   allowedRoles   — optional array of roles, e.g. ['verifier', 'admin']
 *                    if omitted, any authenticated user is allowed
 *   redirectTo     — where to send unauthorized users (default: '/')
 */
export const ProtectedRoute = ({ children, allowedRoles, redirectTo = '/' }) => {
    const { isAuthenticated, user, loading } = useAuth();

    // Still loading session — render nothing (avoid flash)
    if (loading) return null;

    // Not logged in
    if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

    // Role check
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/home" replace />;
    }

    return children;
};
