import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaTimes, FaSearch, FaTrash, FaExclamationTriangle, FaEdit, FaSave, FaUserCog, FaUserLock, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import config from '../../config/config';
import SelectionLayout from '../components/SelectionLayout';
import { useNavigate } from 'react-router-dom';
import { ADMIN_RIGHTS_INFO } from '../../utils/rights';
import { IoMedicalOutline } from 'react-icons/io5';

interface User {
  _id: string;
  userId: string;
  firstName: string;
  surname: string;
  middleName?: string;
  department: string;
  position: string;
  email: string;
  phoneNumber: string;
  rights: string[];
  requirePasswordChange?: boolean;
  isLocked?: boolean;
  loginAttempts?: number;
  lockUntil?: string;
  fullName?: string;
}

const Settings: React.FC = () => {
  const [searchUserId, setSearchUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedRights, setSelectedRights] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingUserDetails, setIsEditingUserDetails] = useState(false);
  const [userDetailsForm, setUserDetailsForm] = useState({
    firstName: '',
    surname: '',
    middleName: '',
    department: '',
    position: '',
    email: '',
    phoneNumber: ''
  });
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setSelectedRights(user.rights);
      setUserDetailsForm({
        firstName: user.firstName,
        surname: user.surname,
        middleName: user.middleName || '',
        department: user.department,
        position: user.position,
        email: user.email,
        phoneNumber: user.phoneNumber
      });
    }
  }, [user]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !/^\d*$/.test(value)) {
      return;
    }
    setSearchUserId(value);
    setUser(null);
  };

  const searchUser = async () => {
    if (!searchUserId) {
      toast.error('Please enter a User ID');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${config.apiUrl}/api/admin/users/search/${searchUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'User not found');
      }

      const userData = await response.json();
      setUser(userData);
      setSelectedRights(userData.rights);
      setIsEditingUserDetails(false);
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to search user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (userId: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = tokenData.userId;
      
      if (currentUserId === userId) {
        localStorage.removeItem('adminToken');
        toast.success('Your permissions have been updated. Please log in again.');
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  };

  const handleUpdateRights = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${config.apiUrl}/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rights: selectedRights
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user rights');
      }

      toast.success('User rights updated successfully');
      setUser(prev => prev ? { ...prev, rights: selectedRights } : null);
      
      // Call handleLogout after successful update
      handleLogout(user.userId);
    } catch (error) {
      console.error('Error updating rights:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user rights');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const endpoint = user.isLocked ? 'unlock' : 'lock';
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${config.apiUrl}/api/admin/users/${user._id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();
      console.log('Response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Server returned invalid response');
      }

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${endpoint} account`);
      }

      setUser(data.user);
      toast.success(data.message);
    } catch (error) {
      console.error(`Error ${user.isLocked ? 'unlocking' : 'locking'} account:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${user.isLocked ? 'unlock' : 'lock'} account`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${config.apiUrl}/api/admin/users/${user.userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      toast.success(data.message || 'User deleted successfully');
      setShowDeleteConfirm(false);
      setUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleUserDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetailsForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateUserDetails = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${config.apiUrl}/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userDetailsForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user details');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success('User details updated successfully');
      setIsEditingUserDetails(false);
      
      // Call handleLogout after successful update
      handleLogout(user.userId);
    } catch (error) {
      console.error('Error updating user details:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user details');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${config.apiUrl}/api/admin/users/${user._id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: resetPasswordForm.newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }

      toast.success('Password reset successfully');
      setResetPasswordForm({ newPassword: '' });
      
      // Call handleLogout after successful update
      handleLogout(user.userId);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SelectionLayout>
      <div className="p-6 relative z-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Search Section with Results */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <FaSearch className="text-blue-100" />
                {user ? (
                  <>
                    User Management
                    <span className="text-base font-normal text-blue-100">
                      {user.firstName} {user.surname} ({user.userId})
                    </span>
                  </>
                ) : (
                  'Search User'
                )}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Search Input */}
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchUserId}
                  onChange={handleSearch}
                  placeholder="Enter User ID"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                />
                <button
                  onClick={searchUser}
                  disabled={loading || !searchUserId}
                  className={`px-6 py-3 rounded-lg text-white font-medium ${
                    loading || !searchUserId
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                  }`}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              {user && (
                <div className="mt-6 space-y-6">
                  {/* Tabs Navigation */}
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex overflow-x-auto">
                      <button
                        onClick={() => setActiveTab('details')}
                        className={`px-6 py-4 font-medium text-sm flex items-center gap-2 ${
                          activeTab === 'details'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        <FaUser className="w-4 h-4" />
                        User Details
                      </button>
                      <button
                        onClick={() => setActiveTab('rights')}
                        className={`px-6 py-4 font-medium text-sm flex items-center gap-2 ${
                          activeTab === 'rights'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        <FaUserCog className="w-4 h-4" />
                        User Rights
                      </button>
                      <button
                        onClick={() => setActiveTab('security')}
                        className={`px-6 py-4 font-medium text-sm flex items-center gap-2 ${
                          activeTab === 'security'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        <FaUserLock className="w-4 h-4" />
                        Security
                      </button>
                      <button
                        onClick={() => setActiveTab('danger')}
                        className={`px-6 py-4 font-medium text-sm flex items-center gap-2 ${
                          activeTab === 'danger'
                            ? 'text-red-600 dark:text-red-400 border-b-2 border-red-500'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        <FaTrash className="w-4 h-4" />
                        Danger Zone
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-6">
                    {/* User Details Tab */}
                    {activeTab === 'details' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                            User Information
                          </h4>
                          {!isEditingUserDetails ? (
                            <button
                              onClick={() => setIsEditingUserDetails(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <FaEdit /> Edit Details
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setIsEditingUserDetails(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleUpdateUserDetails}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                <FaSave /> Save Changes
                              </button>
                            </div>
                          )}
                        </div>

                        {/* User Details Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              First Name
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              value={userDetailsForm.firstName}
                              onChange={handleUserDetailsChange}
                              disabled={!isEditingUserDetails}
                              className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Middle Name
                            </label>
                            <input
                              type="text"
                              name="middleName"
                              value={userDetailsForm.middleName}
                              onChange={handleUserDetailsChange}
                              disabled={!isEditingUserDetails}
                              className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Surname
                            </label>
                            <input
                              type="text"
                              name="surname"
                              value={userDetailsForm.surname}
                              onChange={handleUserDetailsChange}
                              disabled={!isEditingUserDetails}
                              className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Department
                            </label>
                            <input
                              type="text"
                              name="department"
                              value={userDetailsForm.department}
                              onChange={handleUserDetailsChange}
                              disabled={!isEditingUserDetails}
                              className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Position
                            </label>
                            <input
                              type="text"
                              name="position"
                              value={userDetailsForm.position}
                              onChange={handleUserDetailsChange}
                              disabled={!isEditingUserDetails}
                              className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={userDetailsForm.email}
                              onChange={handleUserDetailsChange}
                              disabled={!isEditingUserDetails}
                              className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={userDetailsForm.phoneNumber}
                              onChange={handleUserDetailsChange}
                              disabled={!isEditingUserDetails}
                              className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              User ID
                            </label>
                            <input
                              type="text"
                              value={user.userId}
                              readOnly
                              className="w-full px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rights Management Tab */}
                    {activeTab === 'rights' && (
                      <div className="space-y-6">
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white">User Permissions</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Manage the permissions granted to this user account.
                        </p>

                        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Available Rights
                            </label>
                            <select
                              className="w-full px-4 py-3 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value && !selectedRights.includes(value)) {
                                  setSelectedRights([...selectedRights, value]);
                                }
                                e.target.value = '';
                              }}
                              value=""
                            >
                              <option value="">Select a right to add...</option>
                              {Object.entries(ADMIN_RIGHTS_INFO).map(([key, info]) => (
                                !selectedRights.includes(info.value) && (
                                  <option key={info.value} value={info.value}>
                                    {key.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                  </option>
                                )
                              ))}
                            </select>
                          </div>

                          <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Selected Permissions
                            </h4>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                              {selectedRights.length > 0 ? (
                                selectedRights.map((right) => {
                                  const rightInfo = Object.entries(ADMIN_RIGHTS_INFO).find(([_, info]) => info.value === right);
                                  if (!rightInfo) return null;
                                  const [key, info] = rightInfo;

                                  return (
                                    <div
                                      key={right}
                                      className="flex items-start justify-between p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30"
                                    >
                                      <div className="flex-1">
                                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                          {key.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                        </h5>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                          {info.description}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setSelectedRights(selectedRights.filter(r => r !== right));
                                        }}
                                        className="ml-3 p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                      >
                                        <FaTimes className="w-4 h-4" />
                                      </button>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                                  <FaShieldAlt className="mx-auto h-8 w-8 text-gray-400" />
                                  <p className="mt-2 text-sm">No permissions assigned yet</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end mt-6">
                            <button
                              onClick={handleUpdateRights}
                              disabled={loading}
                              className={`px-6 py-3 rounded-lg text-white font-medium ${
                                loading
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                              }`}
                            >
                              {loading ? 'Saving...' : 'Update Permissions'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                      <div className="space-y-6">
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white">Account Security</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Manage the security settings for this user account.
                        </p>

                        {/* Account Lock Status */}
                        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                          <div className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-800 dark:text-white">Account Status</h5>
                                <div className="mt-1">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user.isLocked 
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  }`}>
                                    {user.isLocked ? 'Locked' : 'Active'}
                                  </span>
                                </div>
                                {user.isLocked && user.lockUntil && (
                                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Locked until: {new Date(user.lockUntil).toLocaleString()}
                                  </p>
                                )}
                                {user.loginAttempts && user.loginAttempts > 0 && (
                                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Failed login attempts: {user.loginAttempts}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={handleToggleLock}
                                disabled={loading}
                                className={`px-4 py-2 text-white rounded-lg font-medium ${
                                  user.isLocked 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-red-600 hover:bg-red-700'
                                } transition-colors disabled:opacity-50`}
                              >
                                {loading ? 'Processing...' : user.isLocked ? 'Unlock Account' : 'Lock Account'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Reset Password Section */}
                        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                          <div className="p-6">
                            <h5 className="font-medium text-gray-800 dark:text-white mb-4">Reset Password</h5>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  New Password
                                </label>
                                <input
                                  type="password"
                                  value={resetPasswordForm.newPassword}
                                  onChange={(e) => setResetPasswordForm({ newPassword: e.target.value })}
                                  placeholder="Enter new password"
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                                />
                              </div>
                              <button
                                onClick={handleResetPassword}
                                disabled={loading || !resetPasswordForm.newPassword}
                                className={`px-4 py-2 text-white rounded-lg font-medium ${
                                  loading || !resetPasswordForm.newPassword
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                } transition-colors`}
                              >
                                {loading ? 'Resetting...' : 'Reset Password'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Danger Zone Tab */}
                    {activeTab === 'danger' && (
                      <div className="space-y-6">
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white">Danger Zone</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          These actions are irreversible. Proceed with caution.
                        </p>

                        <div className="bg-white dark:bg-gray-700 rounded-lg border border-red-200 dark:border-red-800 overflow-hidden">
                          <div className="p-6">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                              </div>
                              <div className="ml-3">
                                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Delete User Account</h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                  <p>
                                    This will permanently delete this user account and all associated data. 
                                    This action cannot be undone.
                                  </p>
                                </div>
                                <div className="mt-4">
                                  <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    disabled={loading}
                                  >
                                    {loading ? 'Deleting...' : 'Delete Account'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] overflow-y-auto"
              >
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900"></div>
                  </div>

                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
                  >
                    <div>
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                        <FaExclamationTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                          Delete User Account
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete this user account? This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                        onClick={handleDeleteUser}
                        disabled={loading}
                      >
                        {loading ? 'Deleting...' : 'Delete'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-1 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </SelectionLayout>
  );
};

export default Settings;