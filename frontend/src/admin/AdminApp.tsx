import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminSelection from './pages/AdminSelection';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { DarkModeProvider } from './context/DarkModeContext';
import './styles/globals.css'; // Import the global styles

// Website Management imports
import WebsiteLayout from './website/components/WebsiteLayout';
import WebsiteDashboard from './website/pages/WebsiteDashboard';
import WebsiteMedia from './website/pages/WebsiteMedia';
import WebsiteMessages from './website/pages/WebsiteMessages';
import WebsiteSettings from './website/pages/WebsiteSettings';
import Subscribers from './website/pages/Subscribers';

// BodaBoda Smart imports
import BodabodaLayout from './bodaboda/components/BodabodaLayout';
import Dashboard from './bodaboda/pages/Dashboard';
import Rider from './bodaboda/pages/Rider';

// Leadership Management imports
import LeadershipLayout from './leadership/components/LeadershipLayout';
import LeadershipDashboard from './leadership/pages/LeadershipDashboard';
import ManageRegistrations from './leadership/pages/ManageRegistrations';

// Dental Health Program imports
import DentalLayout from './dental/components/DentalLayout';
import DentalDashboard from './dental/pages/DentalDashboard';
import PatientRecords from './dental/pages/PatientRecords';
import Appointments from './dental/pages/Appointments';
import DentalSettings from './dental/pages/DentalSettings';

const AdminApp: React.FC = () => {
  return (
    <div className="admin-layout">
      <DarkModeProvider>
        <Routes>
          {/* Public route for login */}
          <Route path="login" element={<AdminLogin />} />

          {/* Protected route for selection page */}
          <Route 
            path="/"
            element={<Navigate to="/admin/select" replace />}
          />

          <Route 
            path="select" 
            element={
              <ProtectedRoute>
                <AdminSelection />
              </ProtectedRoute>
            } 
          />

          {/* Selection level routes */}
          <Route path="settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />

          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Website Management Routes */}
          <Route path="website" element={
            <ProtectedRoute>
              <WebsiteLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<WebsiteDashboard />} />
            <Route path="media" element={<WebsiteMedia />} />
            <Route path="messages" element={<WebsiteMessages />} />
            <Route path="subscribers" element={<Subscribers />} />
            <Route path="settings" element={<WebsiteSettings />} />
          </Route>

          {/* BodaBoda Smart Routes */}
          <Route path="bodaboda" element={
            <ProtectedRoute>
              <BodabodaLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rider" element={<Rider />} />
          </Route>

          {/* Leadership Management Routes */}
          <Route path="leadership" element={
            <ProtectedRoute>
              <LeadershipLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<LeadershipDashboard />} />
            <Route path="manage-registrations" element={<ManageRegistrations />} />
          </Route>

          {/* Dental Health Program Routes */}
          <Route path="dental" element={
            <ProtectedRoute>
              <DentalLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DentalDashboard />} />
            <Route path="patients" element={<PatientRecords />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="settings" element={<DentalSettings />} />
          </Route>
        </Routes>
      </DarkModeProvider>
    </div>
  );
};

export default AdminApp;
