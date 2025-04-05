import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IoStatsChart,
  IoPeople,
  IoCalendar,
  IoSettings
} from 'react-icons/io5';

interface DentalSidebarProps {
  isCollapsed: boolean;
}

const DentalSidebar: React.FC<DentalSidebarProps> = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    {
      name: 'Dashboard',
      icon: <IoStatsChart className="w-6 h-6" />,
      path: '/admin/dental/dashboard'
    },
    {
      name: 'Patient Records',
      icon: <IoPeople className="w-6 h-6" />,
      path: '/admin/dental/patients'
    },
    {
      name: 'Appointments',
      icon: <IoCalendar className="w-6 h-6" />,
      path: '/admin/dental/appointments'
    },
    {
      name: 'Settings',
      icon: <IoSettings className="w-6 h-6" />,
      path: '/admin/dental/settings'
    }
  ];

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 transition-all duration-300 z-50 border-r border-gray-200 dark:border-gray-700
      ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        <nav className="flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                ${location.pathname === item.path ? 'bg-gray-100 dark:bg-gray-700 text-rose-600 dark:text-rose-400' : ''}`}
            >
              <span className="flex items-center justify-center w-8">
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="ml-3">{item.name}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default DentalSidebar; 