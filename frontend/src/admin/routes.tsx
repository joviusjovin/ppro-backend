import { Navigate, Outlet } from 'react-router-dom';
import AdminSelection from './pages/AdminSelection';
import WebsiteMessages from './website/pages/WebsiteMessages';
import BobodaLayout from './bodaboda/pages/BobodaLayout';
import Unauthorized from './pages/Unauthorized';
import LeadershipLayout from './leadership/components/LeadershipLayout';
import LeadershipDashboard from './leadership/pages/LeadershipDashboard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

// Update your routes array
export const routes = [
  {
    path: '/admin',
    element: <ProtectedRoute><AdminSelection /></ProtectedRoute>
  },
  {
    path: '/admin/selection',
    element: <ProtectedRoute><AdminSelection /></ProtectedRoute>
  },
  {
    path: '/admin/website/messages',
    element: <ProtectedRoute><WebsiteMessages /></ProtectedRoute>
  },
  {
    path: '/admin/bodaboda',
    element: <ProtectedRoute><BobodaLayout><Outlet /></BobodaLayout></ProtectedRoute>,
    children: [
      // Your existing bodaboda routes
    ]
  },
  {
    path: '/admin/unauthorized',
    element: <Unauthorized />
  },
  {
    path: '/admin/leadership',
    element: <ProtectedRoute><LeadershipLayout><Outlet /></LeadershipLayout></ProtectedRoute>,
    children: [
      {
        path: 'dashboard',
        element: <ProtectedRoute><LeadershipDashboard /></ProtectedRoute>
      }
    ]
  },
]; 