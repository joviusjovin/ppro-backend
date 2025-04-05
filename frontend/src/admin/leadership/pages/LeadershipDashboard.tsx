import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../../config/config';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { FaUsers, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

interface Registration {
  _id: string;
  firstName: string;
  middleName?: string;
  surname: string;
  email: string;
  phone: string;
  experience: string;
  leadershipGoals: string;
  additionalComments?: string;
  registrationDate: string;
  status?: 'pending' | 'accepted' | 'rejected';
  gender: string;
  region: string;
}

interface DashboardStats {
  total: number;
  accepted: number;
  pending: number;
  rejected: number;
}

interface RegionStats {
  region: string;
  count: number;
}

interface GenderStats {
  male: number;
  female: number;
}

interface DemographicStats {
  experienceBreakdown: {
    [key: string]: number;
  };
  regionBreakdown: {
    [key: string]: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const LeadershipDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    accepted: 0,
    pending: 0,
    rejected: 0
  });
  const [genderStats, setGenderStats] = useState<GenderStats>({ male: 0, female: 0 });
  const [topRegions, setTopRegions] = useState<RegionStats[]>([]);
  const [demographicStats, setDemographicStats] = useState<DemographicStats>({
    experienceBreakdown: {},
    regionBreakdown: {}
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      console.log('Fetching registrations...');
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.apiUrl}/api/admin/leadership-registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Fetched data:', data);

      if (data.success) {
        setRegistrations(data.data);
        calculateStats(data.data);
      } else {
        console.error('Failed to fetch registrations:', data.message);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDemographicStats = (data: Registration[]) => {
    const experienceBreakdown = data.reduce((acc: { [key: string]: number }, reg) => {
      acc[reg.experience] = (acc[reg.experience] || 0) + 1;
      return acc;
    }, {});

    const regionBreakdown = data.reduce((acc: { [key: string]: number }, reg) => {
      acc[reg.region] = (acc[reg.region] || 0) + 1;
      return acc;
    }, {});

    setDemographicStats({ experienceBreakdown, regionBreakdown });
  };

  const calculateStats = (data: Registration[]) => {
    const newStats = {
      total: data.length,
      accepted: data.filter(reg => reg.status === 'accepted').length,
      pending: data.filter(reg => !reg.status || reg.status === 'pending').length,
      rejected: data.filter(reg => reg.status === 'rejected').length
    };
    setStats(newStats);

    const genderData = {
      male: data.filter(reg => reg.gender === 'Male').length,
      female: data.filter(reg => reg.gender === 'Female').length
    };
    setGenderStats(genderData);

    const regionCounts = data.reduce((acc: { [key: string]: number }, reg) => {
      acc[reg.region] = (acc[reg.region] || 0) + 1;
      return acc;
    }, {});

    const sortedRegions = Object.entries(regionCounts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTopRegions(sortedRegions);
    calculateDemographicStats(data);
  };

  // Prepare data for charts
  const genderChartData = [
    { name: 'Male', value: genderStats.male },
    { name: 'Female', value: genderStats.female }
  ];

  const experienceChartData = Object.entries(demographicStats.experienceBreakdown).map(([name, value]) => ({
    name,
    value
  }));

  const regionChartData = Object.entries(demographicStats.regionBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({
      name,
      value
    }));

  const statusChartData = [
    { name: 'Accepted', value: stats.accepted },
    { name: 'Pending', value: stats.pending },
    { name: 'Rejected', value: stats.rejected }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Stats Cards with Icons and Animations */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Registrations</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.total}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaUsers className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm mb-1">Accepted</p>
              <h3 className="text-3xl font-bold text-green-700">{stats.accepted}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm mb-1">Pending</p>
              <h3 className="text-3xl font-bold text-yellow-700">{stats.pending}</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaClock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm mb-1">Rejected</p>
              <h3 className="text-3xl font-bold text-red-700">{stats.rejected}</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FaTimesCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section with Enhanced Styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gender Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Gender Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderChartData.map((item, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Registration Status</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((item, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Experience Distribution Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Experience Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={experienceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Regional Distribution Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Top 5 Regions</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Registrations Table with Enhanced Styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Recent Registrations</h2>
          <p className="text-gray-600 mt-1">Latest 5 registrations in the system</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations
                .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
                .slice(0, 5)
                .map((reg) => (
                  <tr key={reg._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {`${reg.firstName} ${reg.middleName || ''} ${reg.surname}`.trim()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{reg.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{reg.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{reg.experience}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        reg.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        reg.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reg.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(reg.registrationDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default LeadershipDashboard;
