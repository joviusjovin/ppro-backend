import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  IoPersonOutline, 
  IoMailOutline, 
  IoTimeOutline, 
  IoShieldCheckmarkOutline, 
  IoCheckmarkCircleOutline, 
  IoChevronDownOutline, 
  IoChevronUpOutline,
  IoPhonePortraitOutline,
  IoLocationOutline,
  IoStatsChartOutline,
  IoBriefcaseOutline,
  IoIdCardOutline,
  IoGlobeOutline
} from 'react-icons/io5';
import SelectionLayout from '../components/SelectionLayout';
import { toast } from 'react-hot-toast';
import config from '../../config/config';

interface AdminData {
  name: string;
  email: string;
  userId: string;
  phone: string;
  department: string;
  position: string;
  location: string;
  rights: string[];
  joinDate: string;
  lastLogin: string;
  status: string;
  recentActivities: Array<{
    type?: string;
    time: string;
    description: string;
  }>;
}

const SafeRender: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Render error:', error);
    return <div className="text-red-500">Error rendering content</div>;
  }
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    console.error('Date parsing error:', error);
    return dateString;
  }
};

// Add this mapping for display names
const RIGHTS_DISPLAY_NAMES: { [key: string]: string } = {
  reset_password: 'Reset Password',
  edit_rider: 'Edit Rider',
  delete_rider: 'Delete Rider',
  add_rider: 'Add Rider',
  manage_users: 'User Management',
  manage_bobodasmart: 'BobodaSmart Management',
  manage_website: 'Website Management'
};

const Profile: React.FC = () => {
  const [showRights, setShowRights] = useState(true);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminData | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          console.error('No token found');
          toast.error('Please login again');
          return;
        }

        console.log('Fetching profile with token:', token.substring(0, 10) + '...');
        console.log('API URL:', `${config.apiUrl}/api/admin/profile`);

        const response = await fetch(`${config.apiUrl}/api/admin/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Failed to fetch profile data: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Raw response data:', responseData);

        // Ensure data has the correct structure
        const defaultData: AdminData = {
          name: responseData.data?.name || 'Unknown User',
          email: responseData.data?.email || 'No email',
          userId: responseData.data?.userId || 'No ID',
          phone: responseData.data?.phone || 'No phone',
          department: responseData.data?.department || 'No department',
          position: responseData.data?.position || 'No position',
          location: responseData.data?.location || 'No location',
          rights: responseData.data?.rights || [],
          joinDate: responseData.data?.joinDate || new Date().toISOString(),
          lastLogin: responseData.data?.lastLogin || new Date().toISOString(),
          status: responseData.data?.status || 'Active',
          recentActivities: responseData.data?.recentActivities || []
        };

        console.log('Processed data:', defaultData);
        setAdminData(defaultData);

      } catch (error) {
        console.error('Error in fetchProfileData:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <SelectionLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </SelectionLayout>
    );
  }

  if (!adminData) {
    return (
      <SelectionLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Failed to load profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please try refreshing the page
            </p>
          </div>
        </div>
      </SelectionLayout>
    );
  }

  const names = adminData.name.split(' ');
  const firstName = names[0];
  const surname = names[names.length - 1];
  const userInitials = firstName && surname ? (firstName[0] + surname[0]).toUpperCase() : 'A';

  return (
    <SelectionLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <SafeRender>
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="h-48 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/10 to-transparent"></div>
              </div>
              
              <div className="px-8 pb-8">
                <div className="flex flex-col md:flex-row md:items-end -mt-20 mb-6">
                  <div className="flex items-end">
                    <div className="h-36 w-36 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-300">
                      {userInitials}
                    </div>
                    <div className="ml-6 mb-4">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{adminData.name}</h2>
                      <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">{adminData.position}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          {adminData.status}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 flex items-center">
                          <IoIdCardOutline className="w-4 h-4 mr-1" />
                          ID: {adminData.userId}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SafeRender>

          <SafeRender>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 p-6 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl text-white">
                    <IoTimeOutline size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Time with PPRO</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                      {Math.floor((new Date().getTime() - new Date(adminData.joinDate).getTime()) / (1000 * 60 * 60 * 24))} Days
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 p-6 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500 rounded-xl text-white">
                    <IoBriefcaseOutline size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Department</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">{adminData.department}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/30 p-6 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500 rounded-xl text-white">
                    <IoGlobeOutline size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">Location</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">{adminData.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </SafeRender>

          <SafeRender>
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <IoPersonOutline className="text-blue-500" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <IoMailOutline className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white font-medium">{adminData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <IoPhonePortraitOutline className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-gray-900 dark:text-white font-medium">{adminData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <IoLocationOutline className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                      <p className="text-gray-900 dark:text-white font-medium">{adminData.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <IoStatsChartOutline className="text-blue-500" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {adminData.recentActivities?.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <IoTimeOutline className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">{activity.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(activity.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!adminData.recentActivities || adminData.recentActivities.length === 0) && (
                    <p className="text-gray-500 dark:text-gray-400 text-center">No recent activities</p>
                  )}
                </div>
              </div>
            </div>
          </SafeRender>

          <SafeRender>
            {/* Access Rights */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="text-blue-500" />
                  Access Rights & Permissions
                </h3>
                <button onClick={() => setShowRights(!showRights)}>
                  {showRights ? <IoChevronUpOutline className="w-6 h-6" /> : <IoChevronDownOutline className="w-6 h-6" />}
                </button>
              </div>
              
              {showRights && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {adminData.rights.map((right, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                      <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500" />
                      <span className="text-green-800 dark:text-green-400 font-medium">
                        {RIGHTS_DISPLAY_NAMES[right] || right}
                      </span>
                    </div>
                  ))}
                  {adminData.rights.length === 0 && (
                    <div className="col-span-full text-center text-gray-500">
                      No permissions assigned
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </SafeRender>
        </motion.div>
      </div>
    </SelectionLayout>
  );
};

export default Profile;