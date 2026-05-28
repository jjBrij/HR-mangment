// src/components/Dashboard/RecentActivities.jsx
import React from 'react';
import { recentActivities } from '../../data/dummyData';
import { FiClock, FiUserPlus, FiDollarSign, FiLogIn, FiCalendar } from 'react-icons/fi';

const RecentActivities = () => {
  const getIcon = (type) => {
    switch(type) {
      case 'leave': return <FiCalendar className="text-orange-500" />;
      case 'attendance': return <FiLogIn className="text-green-500" />;
      case 'payroll': return <FiDollarSign className="text-blue-500" />;
      case 'hire': return <FiUserPlus className="text-purple-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
        <FiClock className="text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {recentActivities.map((activity, idx) => (
          <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
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
      
      <button className="w-full mt-3 text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2">
        View All Activities →
      </button>
    </div>
  );
};

export default React.memo(RecentActivities);