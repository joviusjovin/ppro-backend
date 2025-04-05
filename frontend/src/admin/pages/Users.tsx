import SelectionLayout from '../components/SelectionLayout';
import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaTimes, FaIdBadge, FaBuilding, FaUserTie, FaCheck, FaGlobe, FaMotorcycle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import config from '../../config/config';
import { RIGHTS } from '../../utils/rights';
import { IoMedicalOutline } from 'react-icons/io5';

interface UserForm {
  firstName: string;
  surname: string;
  middleName: string;
  department: string;
  position: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  rights: string[];
}

const AdminUsers: React.FC = () => {
  const [formData, setFormData] = useState<UserForm>({
    firstName: '',
    surname: '',
    middleName: '',
    department: '',
    position: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    rights: []
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRightsModal, setShowRightsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdUserId, setCreatedUserId] = useState('');
  const [selectedRights, setSelectedRights] = useState<string[]>(['manage_users']);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRightToggle = (rightId: string) => {
    setSelectedRights(prev => 
      prev.includes(rightId) 
        ? prev.filter(r => r !== rightId) 
        : [...prev, rightId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setShowRightsModal(true);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Log the rights being sent
      console.log('Sending rights:', selectedRights);

      const response = await fetch(`${config.apiUrl}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          rights: selectedRights,
          middleName: formData.middleName || ''
        })
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      setCreatedUserId(data.admin.userId);
      setShowRightsModal(false);
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        firstName: '',
        surname: '',
        middleName: '',
        department: '',
        position: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        rights: []
      });
      setSelectedRights(['manage_users']);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const AVAILABLE_RIGHTS = [
    { id: 'reset_password', label: 'Reset Password', icon: <FaLock className="text-blue-500" /> },
    { id: 'edit_rider', label: 'Edit Rider', icon: <FaUser className="text-green-500" /> },
    { id: 'delete_rider', label: 'Delete Rider', icon: <FaUser className="text-red-500" /> },
    { id: 'add_rider', label: 'Add Rider', icon: <FaUser className="text-purple-500" /> },
    { id: 'manage_users', label: 'Manage Users', icon: <FaUserTie className="text-yellow-500" /> },
    { 
      id: RIGHTS.MANAGE_BOBODASMART, 
      label: 'Manage BobodaSmart', 
      icon: <FaMotorcycle className="text-indigo-500" /> 
    },
    { 
      id: RIGHTS.MANAGE_WEBSITE, 
      label: 'Manage Website', 
      icon: <FaGlobe className="text-cyan-500" /> 
    },
    { 
      id: RIGHTS.MANAGE_LEADERSHIP, 
      label: 'Manage Leadership', 
      icon: <FaUserTie className="text-emerald-500" /> 
    },
    { 
      id: RIGHTS.MANAGE_DENTAL, 
      label: 'Manage Dental Program', 
      icon: <IoMedicalOutline className="text-rose-500" /> 
    },
  ];

  return (
    <SelectionLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Create New User</h2>
                  <p className="text-sm text-blue-100 mt-1">Fill in the details below to create a new user</p>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <FaIdBadge className="text-white text-2xl" />
                </div>
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Personal Info Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-blue-600 mb-4">
                  <FaUser className="text-lg" />
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-3 text-gray-400 text-sm" />
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Middle Name</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-3 text-gray-400 text-sm" />
                      <input
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Middle"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Surname *</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-3 text-gray-400 text-sm" />
                      <input
                        name="surname"
                        value={formData.surname}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Info Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-blue-600 mb-4">
                  <FaUserTie className="text-lg" />
                  <h3 className="text-lg font-semibold">Professional Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Department *</label>
                    <div className="relative">
                      <FaBuilding className="absolute left-3 top-3 text-gray-400 text-sm" />
                      <input
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="IT Department"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Position *</label>
                    <div className="relative">
                      <FaUserTie className="absolute left-3 top-3 text-gray-400 text-sm" />
                      <input
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="System Administrator"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-blue-600 mb-4">
                  <FaEnvelope className="text-lg" />
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-3 text-gray-400 text-sm" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-3 text-gray-400 text-sm" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-blue-600 mb-4">
                  <FaLock className="text-lg" />
                  <h3 className="text-lg font-semibold">Security</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-3 text-gray-400 text-sm" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 8 characters with numbers & symbols</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password *</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-3 text-gray-400 text-sm" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating User...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" />
                      Create Admin User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Rights Modal */}
        <AnimatePresence>
          {showRightsModal && (
            <>
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowRightsModal(false)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                >
                  <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="text-lg font-semibold text-gray-800">Assign Permissions</h3>
                    <button 
                      onClick={() => setShowRightsModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-2">Select the permissions for this admin user:</p>
                    {AVAILABLE_RIGHTS.map(right => (
                      <div 
                        key={right.id}
                        onClick={() => handleRightToggle(right.id)}
                        className={`p-3 text-sm flex items-center space-x-3 cursor-pointer rounded-lg border transition-colors ${
                          selectedRights.includes(right.id) 
                            ? 'border-blue-200 bg-blue-50 text-blue-800' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`flex items-center justify-center h-5 w-5 rounded border ${
                          selectedRights.includes(right.id) 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}>
                          {selectedRights.includes(right.id) && <FaCheck className="text-xs" />}
                        </div>
                        <div className="flex-shrink-0">
                          {right.icon}
                        </div>
                        <span className="font-medium">{right.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                    <button 
                      onClick={() => setShowRightsModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleFinalSubmit}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : 'Confirm Permissions'}
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <>
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowSuccessModal(false)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
                >
                  <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User Created Successfully!</h3>
                    <div className="text-sm text-gray-500 mb-6">
                      <p className="mb-2">The new admin user has been created.</p>
                      <div className="bg-gray-100 p-2 rounded-md">
                        <p className="font-mono text-xs break-all">{createdUserId}</p>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdUserId);
                          toast.success('User ID copied to clipboard!', { 
                            duration: 2000,
                            position: 'top-center',
                            style: {
                              background: '#4CAF50',
                              color: '#fff',
                            }
                          });
                          setShowSuccessModal(false);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Copy ID & Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </SelectionLayout>
  );
};

export default AdminUsers;