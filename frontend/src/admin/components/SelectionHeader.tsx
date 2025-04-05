import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoPersonOutline,
  IoMoonOutline,
  IoSunnyOutline,
  IoHelpCircleOutline,
  IoInformationCircleOutline,
  IoLockClosedOutline,
  IoTimeOutline,
  IoLogOutOutline,
  IoMenuOutline
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import config from '../../config/config';
import { FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { useDarkMode } from '../context/DarkModeContext';

interface SelectionHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const SelectionHeader: React.FC<SelectionHeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOutOfOffice, setIsOutOfOffice] = useState(() => 
    localStorage.getItem('outOfOffice') === 'true'
  );
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const adminName = localStorage.getItem('adminName') || 'PPRO USER';
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState({
    length: false,
    alphanumeric: false,
    match: false,
    different: false
  });

  // Use the context instead
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add password validation effect
  useEffect(() => {
    setRequirements({
      length: passwordForm.newPassword.length >= 6,
      alphanumeric: /^(?=.*[a-zA-Z])(?=.*\d).+$/.test(passwordForm.newPassword),
      match: passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword !== '',
      different: passwordForm.newPassword !== '' && passwordForm.currentPassword !== '' && 
                passwordForm.newPassword !== passwordForm.currentPassword
    });
  }, [passwordForm]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminRole');
    navigate('/admin/login');
  };

  const toggleOutOfOffice = () => {
    setIsOutOfOffice(!isOutOfOffice);
    localStorage.setItem('outOfOffice', (!isOutOfOffice).toString());
  };

  const openUserManual = () => {
    window.open('/user-manual.pdf', '_blank');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${config.apiUrl}/api/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTouched({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
      });
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getBorderColor = (field: 'new' | 'confirm') => {
    if (field === 'new') {
      if (!touched.newPassword) return 'border-gray-300 dark:border-gray-600';
      if (requirements.length && requirements.alphanumeric && requirements.different) {
        return 'border-green-500 dark:border-green-400';
      }
      return 'border-red-500 dark:border-red-400';
    } else {
      if (!touched.confirmPassword) return 'border-gray-300 dark:border-gray-600';
      if (requirements.match) {
        return 'border-green-500 dark:border-green-400';
      }
      return 'border-red-500 dark:border-red-400';
    }
  };

  const getRequirementColor = (requirement: keyof typeof requirements) => {
    if (!touched.newPassword && requirement !== 'match') return 'text-gray-600 dark:text-gray-400';
    if (!touched.confirmPassword && requirement === 'match') return 'text-gray-600 dark:text-gray-400';
    return requirements[requirement] ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getRequirementDotColor = (requirement: keyof typeof requirements) => {
    if (!touched.newPassword && requirement !== 'match') return 'bg-gray-400';
    if (!touched.confirmPassword && requirement === 'match') return 'bg-gray-400';
    return requirements[requirement] ? 'bg-green-500' : 'bg-red-500';
  };

  const menuItems = [
    {
      icon: <IoPersonOutline className="w-5 h-5" />,
      label: 'My Profile',
      onClick: () => navigate('/admin/profile')
    },
    {
      icon: <IoTimeOutline className="w-5 h-5" />,
      label: isOutOfOffice ? 'Back to Office' : 'Out of Office',
      onClick: toggleOutOfOffice,
      className: isOutOfOffice ? 'text-green-600 hover:bg-green-50' : ''
    },
    {
      icon: isDarkMode ? <IoSunnyOutline className="w-5 h-5" /> : <IoMoonOutline className="w-5 h-5" />,
      label: isDarkMode ? 'Light Mode' : 'Dark Mode',
      onClick: toggleDarkMode
    },
    {
      icon: <IoHelpCircleOutline className="w-5 h-5" />,
      label: 'User Manual',
      onClick: openUserManual
    },
    {
      icon: <IoInformationCircleOutline className="w-5 h-5" />,
      label: 'About',
      onClick: () => setShowAboutModal(true)
    },
    {
      icon: <IoLockClosedOutline className="w-5 h-5" />,
      label: 'Change Password',
      onClick: () => setShowPasswordModal(true)
    },
    {
      icon: <IoLogOutOutline className="w-5 h-5" />,
      label: 'Logout',
      onClick: handleLogout,
      className: 'text-red-600 hover:bg-red-50'
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 z-[60] h-16">
      <div className="flex justify-between items-center h-full">
        <div className="flex items-center h-full">
          <button
            onClick={onToggleSidebar}
            className="p-4 h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <IoMenuOutline className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">Staff Portal</h1>
        </div>

        {/* User Profile Button */}
        <div className="relative pr-4" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <span className="font-medium">{adminName}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              {/* User Info */}
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-white">{adminName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {localStorage.getItem('adminRole') || 'Administrator'}
                </p>
              </div>

              {menuItems.map((item, index) => (
                <React.Fragment key={item.label}>
                  <button
                    onClick={() => {
                      item.onClick();
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${item.className || ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                  {index === 1 || index === 3 ? (
                    <div className="my-1 border-b border-gray-200 dark:border-gray-700" />
                  ) : null}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[28rem]">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Change Password</h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  >
                    {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${getBorderColor('new')}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  >
                    {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${getBorderColor('confirm')}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  >
                    {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className={`mt-4 p-4 rounded-lg ${
                !touched.newPassword && !touched.confirmPassword 
                  ? 'bg-gray-50 dark:bg-gray-800/30' 
                  : requirements.length && requirements.alphanumeric && requirements.match && requirements.different
                    ? 'bg-green-50 dark:bg-green-900/30'
                    : 'bg-red-50 dark:bg-red-900/30'
              }`}>
                <h4 className={`font-semibold mb-3 flex items-center gap-2 ${
                  !touched.newPassword && !touched.confirmPassword
                    ? 'text-gray-800 dark:text-gray-200'
                    : requirements.length && requirements.alphanumeric && requirements.match && requirements.different
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                }`}>
                  <FaShieldAlt />
                  Password Requirements
                </h4>
                <ul className="space-y-2">
                  <li className={`flex items-center gap-2 text-sm ${getRequirementColor('length')}`}>
                    <div className={`w-2 h-2 rounded-full ${getRequirementDotColor('length')}`} />
                    At least 6 characters long
                  </li>
                  <li className={`flex items-center gap-2 text-sm ${getRequirementColor('alphanumeric')}`}>
                    <div className={`w-2 h-2 rounded-full ${getRequirementDotColor('alphanumeric')}`} />
                    Include both letters and numbers
                  </li>
                  <li className={`flex items-center gap-2 text-sm ${getRequirementColor('match')}`}>
                    <div className={`w-2 h-2 rounded-full ${getRequirementDotColor('match')}`} />
                    Passwords match
                  </li>
                  <li className={`flex items-center gap-2 text-sm ${getRequirementColor('different')}`}>
                    <div className={`w-2 h-2 rounded-full ${getRequirementDotColor('different')}`} />
                    Different from current password
                  </li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setTouched({
                      currentPassword: false,
                      newPassword: false,
                      confirmPassword: false
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading || !requirements.length || !requirements.alphanumeric || !requirements.match || !requirements.different}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {loading ? 'Changing...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">About PPRO</h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>Partnership For Poverty Reduction Organisation (PPRO)</p>
              <p>Version: 1.0.0</p>
              <p>© 2024 PPRO. All rights reserved.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAboutModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default SelectionHeader; 