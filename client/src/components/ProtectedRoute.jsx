import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard if they try to access an unauthorized route
        if (user.role === 'principal') return <Navigate to="/principal-dashboard" replace />;
        if (user.role === 'hod') return <Navigate to="/hod-dashboard" replace />;
        if (user.role === 'fa') return <Navigate to="/fa-dashboard" replace />;
        if (user.role === 'teacher') return <Navigate to="/teacher-dashboard" replace />;
        if (user.role === 'student') return <Navigate to="/student-dashboard" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
