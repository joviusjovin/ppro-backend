import React from 'react';
import { Navigate } from 'react-router-dom';
import { useBobodaRights } from '../../../hooks/useBobodaRights';

interface BobodaProtectedRouteProps {
  children: React.ReactNode;
}

const BobodaProtectedRoute: React.FC<BobodaProtectedRouteProps> = ({ children }) => {
  const hasAccess = useBobodaRights();

  if (!hasAccess) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default BobodaProtectedRoute; 