import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IoHomeOutline,
  IoPeopleOutline,
  IoSettingsOutline,
  IoLogOutOutline,
} from 'react-icons/io5';

interface AdminSelectionSidebarProps {
  isSidebarOpen: boolean;
}

const AdminSelectionSidebar: React.FC<AdminSelectionSidebarProps> = ({
  isSidebarOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    {
      name: 'Home',
      icon: <IoHomeOutline className="w-6 h-6" />,
      path: '/admin/select'
    },
    {
      name: 'Users',
      icon: <IoPeopleOutline className="w-6 h-6" />,
      path: '/admin/users'
    },
    {
      name: 'Settings',
      icon: <IoSettingsOutline className="w-6 h-6" />,
      path: '/admin/settings'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 transition-all duration-300 z-50 border-r border-gray-200 dark:border-gray-700
      ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex flex-col h-full">
        <nav className="flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                ${location.pathname === item.path ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : ''}`}
            >
              <span className="flex items-center justify-center w-8">
                {item.icon}
              </span>
              {isSidebarOpen && (
                <span className="ml-3">{item.name}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSelectionSidebar; 