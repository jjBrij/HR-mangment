// src/components/Dashboard/StatsCards.jsx - Update to use context
import React from 'react';
import { FiUsers, FiUserX, FiAward, FiTrendingUp } from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';
import { useMemo } from 'react';
const StatsCards = () => {
  const { getDashboardStats, employees, performanceTargets } = useAppContext();

  const stats = React.useMemo(() => {
    return getDashboardStats();
  }, [employees, performanceTargets, getDashboardStats]);

  // Get employee of the month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const employeeOfMonth = performanceTargets
    .filter(t => t.month === currentMonth)
    .sort((a, b) => b.performance_score - a.performance_score)[0];

  const employeeOfMonthData = employeeOfMonth
    ? employees.find(e => e.employee_id === employeeOfMonth.employee_id)
    : null;
 
  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      change: `+${stats.monthlyGrowth}% this month`,
      subtext: `${stats.activeEmployees} active`
    },
    {
      title: 'On Leave Today',
      value: stats.onLeave,
      icon: FiUserX,
      color: 'from-orange-500 to-orange-600',
      change: 'Currently on leave',
      subtext: `${Math.round((stats.onLeave / (stats.totalEmployees || 1)) * 100)}% of workforce`
    },
    {
      title: 'Employee of the Month',
      value: employeeOfMonthData?.name || 'Not Available',
      icon: FiAward,
      color: 'from-yellow-500 to-yellow-600',
      change: employeeOfMonth ? `Score: ${Math.round(employeeOfMonth.performance_score)}%` : 'No data',
      subtext: employeeOfMonthData?.department || 'Add performance targets',
      isEmployeeCard: true
    },
    {
      title: 'Attendance Today',
      value: `${stats.attendance}%`,
      icon: FiTrendingUp,
      color: 'from-purple-500 to-purple-600',
      change: 'Current day',
      subtext: `${stats.totalEmployees - stats.onLeave} employees present`
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className={`stat-card group animate-slide-up ${stat.isEmployeeCard ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              {stat.isEmployeeCard ? (
                <div>
                  <p className="text-base font-bold text-gray-800 mt-1 line-clamp-2">{stat.value}</p>
                  <p className="text-xs text-yellow-600 mt-1 font-medium">{stat.change}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                </div>
              )}
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