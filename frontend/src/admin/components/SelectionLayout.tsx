import React, { useState } from 'react';
import SelectionHeader from './SelectionHeader';
import AdminSelectionSidebar from './SelectionSidebar';

interface SelectionLayoutProps {
  children: React.ReactNode;
}

const SelectionLayout: React.FC<SelectionLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <SelectionHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        
        <AdminSelectionSidebar 
          isSidebarOpen={isSidebarOpen}
        />
      </div>

      <div className={`min-h-screen pt-16 transition-all duration-300
        ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SelectionLayout; 