import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user has the required role
  if (requiredRole && role !== requiredRole) {
    // If trying to access admin route as member, redirect to member dashboard
    if (requiredRole === 'ADMIN' && role === 'MEMBER') {
      return <Navigate to="/member/dashboard" />;
    }
    // If trying to access member route as admin, redirect to admin dashboard
    if (requiredRole === 'MEMBER' && role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" />;
    }
    // Fallback to login
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;