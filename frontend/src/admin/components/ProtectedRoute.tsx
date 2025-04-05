import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('adminToken') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // If we're at root admin path, redirect to select
  if (location.pathname === '/admin') {
    return <Navigate to="/admin/select" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 