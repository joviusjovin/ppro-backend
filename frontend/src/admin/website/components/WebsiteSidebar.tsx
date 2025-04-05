import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IoHomeOutline,
  IoImagesOutline,
  IoMailOutline,
  IoSettingsOutline,
  IoPeopleOutline,
} from 'react-icons/io5';

interface WebsiteSidebarProps {
  isCollapsed: boolean;
}

const WebsiteSidebar: React.FC<WebsiteSidebarProps> = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    {
      name: 'Dashboard',
      icon: <IoHomeOutline className="w-6 h-6" />,
      path: '/admin/website/dashboard'
    },
    {
      name: 'Media Library',
      icon: <IoImagesOutline className="w-6 h-6" />,
      path: '/admin/website/media'
    },
    {
      name: 'Messages',
      icon: <IoMailOutline className="w-6 h-6" />,
      path: '/admin/website/messages'
    },
    {
      name: 'Subscribers',
      icon: <IoPeopleOutline className="w-6 h-6" />,
      path: '/admin/website/subscribers'
    },
    {
      name: 'Settings',
      icon: <IoSettingsOutline className="w-6 h-6" />,
      path: '/admin/website/settings'
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
                ${location.pathname === item.path ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : ''}`}
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

export default WebsiteSidebar; 