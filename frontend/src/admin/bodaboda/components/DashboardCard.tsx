import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, value, change, changeType }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-gray-100">
          {icon}
        </div>
      </div>
      <div className={`mt-4 flex items-center text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
        {changeType === 'increase' ? (
          <FaArrowUp className="mr-1" />
        ) : (
          <FaArrowDown className="mr-1" />
        )}
        <span>{change}% from last {title.includes('Today') ? 'day' : 'week'}</span>
      </div>
    </div>
  );
};

export default DashboardCard;