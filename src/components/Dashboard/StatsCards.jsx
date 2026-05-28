// src/components/Dashboard/StatsCards.jsx
import React from 'react';
import { FiUsers, FiUserX, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { dashboardStats } from '../../data/dummyData';

const StatsCards = () => {
  const stats = [
    { title: 'Total Employees', value: dashboardStats.totalEmployees, icon: FiUsers, color: 'from-blue-500 to-blue-600', change: '+12 this month' },
    { title: 'On Leave', value: dashboardStats.onLeave, icon: FiUserX, color: 'from-orange-500 to-orange-600', change: '3 pending' },
    { title: 'Payroll', value: `$${dashboardStats.payroll}K`, icon: FiDollarSign, color: 'from-green-500 to-green-600', change: 'This month' },
    { title: 'Attendance', value: `${dashboardStats.attendance}%`, icon: FiTrendingUp, color: 'from-purple-500 to-purple-600', change: `${dashboardStats.monthlyGrowth}% vs last month` },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              <p className="text-xs text-green-600 mt-2">{stat.change}</p>
            </div>
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <stat.icon className="text-white text-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(StatsCards);