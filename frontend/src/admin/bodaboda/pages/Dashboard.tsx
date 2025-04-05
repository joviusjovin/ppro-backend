import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaUserPlus,
  FaUserClock,
  FaCalendarAlt,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarCheck
} from 'react-icons/fa';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';

// Types
interface DashboardData {
  totalRiders: number;
  newRegistrations: number;
  activeRiders: number;
  genderDistribution: {
    male: number;
    female: number;
  };
  regionDistribution: Array<{
    name: string;
    count: number;
  }>;
  registrationTimeline: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  regions: {
    total: number;
    mostCommon: string;
  };
  bikeStations: {
    total: number;
    mostCommon: string;
  };
}

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle?: string;
  className?: string;
}

const GENDER_COLORS = ['#0088FE', '#FF69B4'];

// Dashboard Card Component
const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, value, subtitle, className }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 flex flex-col ${className}`}>
      <div className="flex items-center mb-2">
        <div className="mr-2 text-blue-500">{icon}</div>
        <h3 className="text-gray-700 font-medium">{title}</h3>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
};

// Timeline Card Component
const TimelineCard: React.FC<{ title: string; value: number; icon: React.ReactNode; className: string }> = ({ 
  title, value, icon, className 
}) => {
  return (
    <div className={`p-4 rounded-lg flex items-center ${className}`}>
      <div className="flex-1">
        <div className="text-xs font-medium mb-1">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className="text-2xl opacity-50">{icon}</div>
    </div>
  );
};

// Statistic Item Component
const StatItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center py-2">
      <div className="text-gray-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalRiders: 0,
    newRegistrations: 0,
    activeRiders: 0,
    genderDistribution: {
      male: 0,
      female: 0
    },
    regionDistribution: [],
    registrationTimeline: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      thisYear: 0
    },
    regions: {
      total: 0,
      mostCommon: ''
    },
    bikeStations: {
      total: 0,
      mostCommon: ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting to fetch dashboard data...');
        setLoading(true);
        setError(null);

        // Check if token exists
        const token = localStorage.getItem('adminToken');
        console.log('Authentication token status:', token ? 'Found' : 'Not found');
        
        if (!token) {
          setError('No authentication token found. Please log in again.');
          return;
        }

        const data = await dashboardService.getDashboardData();
        console.log('Received dashboard data:', data);
        setDashboardData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        console.error('Detailed error:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
        console.log('Loading state finished');
      }
    };

    fetchData();
  }, []);

  // Add debug logging for current state
  console.log('Current dashboard state:', {
    loading,
    error,
    hasData: dashboardData.totalRiders > 0,
    genderData: [
      { name: 'Male', value: dashboardData.genderDistribution.male },
      { name: 'Female', value: dashboardData.genderDistribution.female }
    ],
    regionData: [...dashboardData.regionDistribution]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  });

  // Transform gender data for pie chart
  const genderData = [
    { name: 'Male', value: dashboardData.genderDistribution.male },
    { name: 'Female', value: dashboardData.genderDistribution.female }
  ];

  // Sort region data by count and get top 5
  const sortedRegionData = [...dashboardData.regionDistribution]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (loading) {
    return <div className="text-center py-10">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DashboardCard 
          icon={<FaUsers size={24} />} 
          title="Total Riders" 
          value={dashboardData.totalRiders} 
        />
        <DashboardCard 
          icon={<FaUserPlus size={24} />} 
          title="New Registrations" 
          value={dashboardData.newRegistrations} 
          subtitle="Today" 
        />
        <DashboardCard 
          icon={<FaUserClock size={24} />} 
          title="Active Riders" 
          value={dashboardData.activeRiders} 
          subtitle="Last 24 hours" 
        />
      </div>

      {/* Registration Timeline */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Registration Timeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <TimelineCard 
            title="Added Today" 
            value={dashboardData.registrationTimeline.today} 
            icon={<FaCalendarDay />} 
            className="bg-yellow-50 text-yellow-800" 
          />
          <TimelineCard 
            title="Added This Week" 
            value={dashboardData.registrationTimeline.thisWeek} 
            icon={<FaCalendarWeek />} 
            className="bg-orange-50 text-orange-800" 
          />
          <TimelineCard 
            title="Added This Month" 
            value={dashboardData.registrationTimeline.thisMonth} 
            icon={<FaCalendarAlt />} 
            className="bg-green-50 text-green-800" 
          />
          <TimelineCard 
            title="Added This Year" 
            value={dashboardData.registrationTimeline.thisYear} 
            icon={<FaCalendarCheck />} 
            className="bg-blue-50 text-blue-800" 
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gender Distribution */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Gender Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Regions */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Top 5 Regions</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedRegionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Riders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Demographic Breakdown */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Demographic Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gender Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-2">Gender</h3>
            <StatItem label="Male" value={dashboardData.genderDistribution.male} />
            <StatItem label="Female" value={dashboardData.genderDistribution.female} />
          </div>
          
          {/* Regions Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-2">Regions</h3>
            <StatItem label="Total Regions" value={dashboardData.regions.total} />
            <StatItem label="Most Common" value={dashboardData.regions.mostCommon} />
          </div>
          
          {/* Bike Stations Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-2">Bike Stations</h3>
            <StatItem label="Total Stations" value={dashboardData.bikeStations.total} />
            <StatItem label="Most Common" value={dashboardData.bikeStations.mostCommon} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;