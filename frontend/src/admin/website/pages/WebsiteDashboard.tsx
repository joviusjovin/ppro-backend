import React, { useState, useEffect } from 'react';
import {  
  IoPersonOutline, 
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoEyeOutline,
  IoTimeOutline,
  IoStatsChartOutline,
  IoCalendarOutline
} from 'react-icons/io5';
import config from '../../../config/config';

interface VisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  averageTimeSpent: string;
  bounceRate: string;
  pageViews: {
    [key: string]: number;
  };
  visitsByTime: {
    [key: string]: number;
  };
  visitsByDate?: { [key: string]: number };
}

interface VisitData {
  visitorId: string;
  page: string;
  timestamp: string;
  duration?: number;
  referrer?: string;
}

interface AnalyticsData {
  recentVisits: Array<{
    page: string;
    timestamp: string;
    duration: number;
  }>;
}

interface DashboardStats {
  visits: VisitStats;
  messages: number;
  totalPages: number;
  totalProjects: number;
  recentVisits?: VisitData[];
  analytics?: AnalyticsData;
}

const WebsiteDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No auth token found');
        throw new Error('No auth token');
      }

      console.log('Fetching stats with range:', timeRange);
      console.log('API URL:', `${config.apiUrl}/api/admin/website/stats?range=${timeRange}`);
      
      const response = await fetch(`${config.apiUrl}/api/admin/website/stats?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not OK:', response.status, response.statusText, errorText);
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      console.log('Received stats data:', data);
      
      if (!data.visits) {
        console.error('No visits data in response:', data);
        throw new Error('Invalid data format');
      }

      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVisitTitle = (timeRange: string) => {
    switch (timeRange) {
      case 'today':
        return "Today's Visits";
      case 'week':
        return 'Last 7 Days Visits';
      case 'month':
        return 'Last 30 Days Visits';
      default:
        return 'All Time Visits';
    }
  };

  const dashboardStats = [
    {
      title: getVisitTitle(timeRange),
      value: stats?.visits.totalVisits.toString() || '0',
      icon: <IoEyeOutline className="w-8 h-8 text-blue-500" />,
      change: `Total visits for selected period`
    },
    {
      title: 'Unique Visitors',
      value: stats?.visits.uniqueVisitors.toString() || '0',
      icon: <IoPersonOutline className="w-8 h-8 text-green-500" />,
      change: `Unique visitors for ${timeRange === 'today' ? 'today' : 
        timeRange === 'week' ? 'last 7 days' : 
        timeRange === 'month' ? 'last 30 days' : 
        'all time'}`
    },
    {
      title: 'Avg. Time Spent',
      value: stats?.visits.averageTimeSpent || '0:00',
      icon: <IoTimeOutline className="w-8 h-8 text-yellow-500" />,
      change: `Average session duration for ${timeRange === 'today' ? 'today' : 
        timeRange === 'week' ? 'last 7 days' : 
        timeRange === 'month' ? 'last 30 days' : 
        'all time'}`
    },
    {
      title: 'Bounce Rate',
      value: stats?.visits.bounceRate || '0%',
      icon: <IoStatsChartOutline className="w-8 h-8 text-red-500" />,
      change: `Single page visits for ${timeRange === 'today' ? 'today' : 
        timeRange === 'week' ? 'last 7 days' : 
        timeRange === 'month' ? 'last 30 days' : 
        'all time'}`
    }
  ];

  const socialLinks = [
    { icon: IoLogoFacebook, url: "#", name: "Facebook" },
    { icon: IoLogoTwitter, url: "#", name: "Twitter" },
    { icon: IoLogoInstagram, url: "#", name: "Instagram" },
    { icon: IoLogoLinkedin, url: "#", name: "LinkedIn" }
  ];

  const contactInfo = {
    email: "ayubmuhajiry@gmail.com",
    phone: "(+255) 764 044 001",
    address: "Office no 1. Masjid haqq, Buguruni, Dar es Salaam",
    poBox: "P.O Box 911"
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Website Dashboard</h1>
        <div className="flex items-center gap-2">
          <IoCalendarOutline className="w-5 h-5 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat) => (
              <div key={stat.title} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Visits</h2>
              <div className="space-y-4">
                {stats?.recentVisits?.slice(0, 5).map((visit, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="text-gray-600">{visit.page}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(visit.timestamp).toLocaleString()}
                      </p>
                      {visit.referrer && (
                        <p className="text-xs text-gray-400">From: {visit.referrer}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {visit.duration ? 
                        `${Math.floor(visit.duration / 60000)}m ${Math.floor((visit.duration % 60000) / 1000)}s` 
                        : 'Active'}
                    </span>
                  </div>
                ))}
                {(!stats?.recentVisits || stats.recentVisits.length === 0) && (
                  <p className="text-gray-500 text-center">No recent visits</p>
                )}
              </div>
            </div>

            {/* Page Views Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Page Views</h2>
              <div className="space-y-4">
                {Object.entries(stats?.visits.pageViews || {}).map(([page, views]) => (
                  <div key={page} className="flex items-center justify-between">
                    <span className="text-gray-600">{page}</span>
                    <span className="font-medium">{views}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visits by Date */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Visits by Date</h2>
              <div className="space-y-4">
                {Object.entries(stats?.visits.visitsByDate || {}).map(([date, count]) => (
                  <div key={date} className="flex items-center justify-between">
                    <span className="text-gray-600">{new Date(date).toLocaleDateString()}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{contactInfo.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-medium">{contactInfo.phone}</p>
                </div>
                <div>
                  <span className="text-gray-600">Address:</span>
                  <p className="font-medium">{contactInfo.address}</p>
                  <p className="font-medium">{contactInfo.poBox}</p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <social.icon className="w-6 h-6 text-blue-600" />
                    <span className="text-gray-600">{social.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WebsiteDashboard; 