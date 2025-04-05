import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMenuOutline, IoArrowBackOutline } from 'react-icons/io5';

interface DentalHeaderProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const DentalHeader: React.FC<DentalHeaderProps> = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 z-[60] h-16">
      <div className="flex justify-between items-center h-full">
        <div className="flex items-center h-full">
          <button
            onClick={onToggleSidebar}
            className="p-4 h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <IoMenuOutline className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => navigate('/admin/select')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors ml-4"
          >
            <IoArrowBackOutline className="w-5 h-5" />
            <span className="ml-2">Back to Selection</span>
          </button>
          <span className="text-gray-300 dark:text-gray-600 mx-4">|</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dental Health Program</h1>
        </div>
      </div>
    </header>
  );
};

export default DentalHeader; 