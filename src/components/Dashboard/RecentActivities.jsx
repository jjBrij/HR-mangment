// src/components/Dashboard/RecentActivities.jsx
import React from 'react';
import { FiClock, FiUserPlus, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const RecentActivities = () => {
  const { getRecentActivities } = useAppContext();
  const activities = getRecentActivities();

  const getIcon = (type) => {
    switch(type) {
      case 'leave': return <FiCalendar className="text-orange-500" />;
      case 'payroll': return <FiDollarSign className="text-blue-500" />;
      case 'hire': return <FiUserPlus className="text-purple-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
          <FiClock className="text-gray-400" />
        </div>
        <p className="text-center text-gray-500 py-4">No recent activities</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
        <FiClock className="text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{activity.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{activity.date}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{activity.description}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RecentActivities);