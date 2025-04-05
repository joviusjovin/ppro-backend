import React, { useEffect, useState } from 'react';
import { IoMedicalOutline, IoPeople, IoCalendar, IoStatsChart } from 'react-icons/io5';
import config from '../../../config/config';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  totalAppointments: number;
  completedAppointments: number;
}

const DentalDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    totalAppointments: 0,
    completedAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${config.apiUrl}${config.adminEndpoints.dental.stats}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: <IoPeople className="w-12 h-12 text-blue-500" />,
      color: 'blue'
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: <IoCalendar className="w-12 h-12 text-green-500" />,
      color: 'green'
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: <IoCalendar className="w-12 h-12 text-purple-500" />,
      color: 'purple'
    },
    {
      title: 'Completed Appointments',
      value: stats.completedAppointments,
      icon: <IoStatsChart className="w-12 h-12 text-rose-500" />,
      color: 'rose'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
        Dental Health Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              {card.icon}
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.title}
                </h3>
                <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                  {loading ? '...' : card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DentalDashboard; 