import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const AuthLayout = () => {
    const token = localStorage.getItem('adminToken');
    
    // Redirect to dashboard if already logged in
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Outlet />
        </div>
    );
};

export default AuthLayout;
