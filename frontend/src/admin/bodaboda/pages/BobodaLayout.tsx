import React from 'react';
import BobodaErrorBoundary from '../components/BobodaErrorBoundary';
import { useBobodaRights } from '../../../hooks/useBobodaRights';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface BodabobaLayoutProps {
  children: React.ReactNode;
}

const BodabobaLayout: React.FC<BodabobaLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const userRights = tokenData.rights || [];

      if (!userRights.includes('manage_bobodasmart')) {
        navigate('/admin/selection');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      navigate('/admin/login');
    }
  }, [navigate]);

  const hasAccess = useBobodaRights();

  if (!hasAccess) {
    return null;
  }

  return (
    <BobodaErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Your layout components */}
        {children}
      </div>
    </BobodaErrorBoundary>
  );
};

export default BodabobaLayout; 