import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BodabodaSidebar from './BodabodaSidebar';
import BodabodaHeader from './BodabodaHeader';

const BodabodaLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <BodabodaHeader 
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        
        <BodabodaSidebar 
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      <div className={`min-h-screen pt-16 transition-all duration-300
        ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BodabodaLayout; 