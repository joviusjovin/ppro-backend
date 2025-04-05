import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  IoBicycleOutline, 
  IoGlobeOutline, 
  IoArrowForwardOutline,
  IoSearchOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoPersonOutline,
  IoMedicalOutline,
} from 'react-icons/io5';
import SelectionLayout from '../components/SelectionLayout';
import { showPermissionDenied } from '../../components/PermissionDeniedToast';
import { RIGHTS } from '../../utils/rights';

const AdminSelection: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Number of items to show per page

  const sections = [
    {
      id: 'bodaboda',
      title: 'BodaBoda Smart',
      description: 'Manage riders, trips, and BodaBoda operations',
      icon: <IoBicycleOutline className="w-10 h-10" />,
      path: '/admin/bodaboda/dashboard',
      gradient: 'from-violet-500 to-purple-500',
      iconColor: 'text-violet-600 dark:text-violet-400',
      requiredRight: RIGHTS.MANAGE_BOBODASMART
    },
    {
      id: 'website',
      title: 'Website Management',
      description: 'Manage website content and user interactions',
      icon: <IoGlobeOutline className="w-10 h-10" />,
      path: '/admin/website/dashboard',
      gradient: 'from-blue-500 to-cyan-500',
      iconColor: 'text-blue-600 dark:text-blue-400',
      requiredRight: RIGHTS.MANAGE_WEBSITE
    },
    {
      id: 'leadership',
      title: 'Leadership Management',
      description: 'Manage leadership capacity building registrations',
      icon: <IoPersonOutline className="w-10 h-10" />,
      path: '/admin/leadership/dashboard',
      gradient: 'from-green-500 to-emerald-500',
      iconColor: 'text-green-600 dark:text-green-400',
      requiredRight: RIGHTS.MANAGE_LEADERSHIP
    },
    {
      id: 'dental',
      title: 'Dental Health Program',
      description: 'Track and manage dental health assistance and patient records',
      icon: <IoMedicalOutline className="w-10 h-10" />,
      path: '/admin/dental/dashboard',
      gradient: 'from-rose-500 to-pink-500',
      iconColor: 'text-rose-600 dark:text-rose-400',
      requiredRight: RIGHTS.MANAGE_DENTAL
    }
  ];

  const filteredSections = sections.filter(section => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      section.title.toLowerCase().includes(searchTerm) ||
      section.description.toLowerCase().includes(searchTerm)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredSections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSections = filteredSections.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const checkPermissionAndNavigate = (path: string, requiredRight: string, systemName: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.log('No token found');
      navigate('/admin/login');
      return;
    }

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const userRights = tokenData.rights || [];
      const hasRight = userRights.includes(requiredRight);
      
      console.log('Navigating to:', path, 'Has right:', hasRight);

      if (!hasRight) {
        console.log('Permission denied for:', systemName);
        showPermissionDenied(systemName);
        return;
      }

      navigate(path);
    } catch (error) {
      console.error('Error checking permissions:', error);
      navigate('/admin/login');
    }
  };

  return (
    <SelectionLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header and Search */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Admin Dashboard Selection
            </h1>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search systems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 
                    dark:border-gray-700 focus:border-blue-500 focus:ring-2 
                    focus:ring-blue-500/20 focus:outline-none bg-white/80 backdrop-blur-sm
                    dark:bg-gray-800/80 text-gray-900 dark:text-white shadow-sm
                    transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSections.map((section) => (
              <motion.div
                key={section.id}
                whileHover={{ scale: 1.02, translateY: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  checkPermissionAndNavigate(section.path, section.requiredRight, section.title);
                }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md
                  overflow-hidden cursor-pointer border border-gray-100 
                  dark:border-gray-700 transition-all duration-200"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700 ${section.iconColor}`}>
                      {section.icon}
                    </div>
                    <IoArrowForwardOutline className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {section.description}
                  </p>
                  
                  <button
                    className={`w-full px-4 py-2 rounded-lg bg-gradient-to-r ${section.gradient} 
                      text-white text-sm font-medium flex items-center justify-center
                      transition-all duration-200 hover:opacity-90`}
                  >
                    Access Dashboard
                    <IoArrowForwardOutline className="ml-2 w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white hover:bg-gray-50 
                  dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50
                  transition-all duration-200 shadow-sm"
              >
                <IoChevronBackOutline className="w-4 h-4" />
              </motion.button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 shadow-sm'
                  }`}
                >
                  {page}
                </motion.button>
              ))}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white hover:bg-gray-50 
                  dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50
                  transition-all duration-200 shadow-sm"
              >
                <IoChevronForwardOutline className="w-4 h-4" />
              </motion.button>
            </div>
          )}

          {/* No Results */}
          {filteredSections.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <p className="text-gray-600 dark:text-gray-400">
                No systems found matching your search.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </SelectionLayout>
  );
};

export default AdminSelection;