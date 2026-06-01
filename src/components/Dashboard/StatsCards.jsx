// src/components/Dashboard/StatsCards.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { FiUsers, FiUserX, FiAward, FiTrendingUp } from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';
import { startOfToday, isWithinInterval, parseISO } from 'date-fns';

const StatsCards = () => {
  const { dashboardStats, refreshTrigger, leaveRequests, employees } = useAppContext();
  const [stats, setStats] = useState(dashboardStats);
  const [actualOnLeave, setActualOnLeave] = useState(0);

  // Calculate real-time on-leave count
  useEffect(() => {
    const today = startOfToday();
    const currentlyOnLeave = leaveRequests.filter(leave => {
      if (leave.status !== 'Approved') return false;
      if (!leave.fromDate || !leave.toDate) return false;
      
      const startDate = parseISO(leave.fromDate);
      const endDate = parseISO(leave.toDate);
      endDate.setHours(23, 59, 59, 999);
      
      return isWithinInterval(today, { start: startDate, end: endDate });
    }).length;
    
    setActualOnLeave(currentlyOnLeave);
  }, [leaveRequests, refreshTrigger]);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const statCards = [
    { 
      title: 'Total Employees', 
      value: stats.totalEmployees, 
      icon: FiUsers, 
      color: 'from-blue-500 to-blue-600', 
      change: `${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}% this month`,
      subtext: `${stats.activeEmployees} active`
    },
    { 
      title: 'On Leave Today', 
      value: actualOnLeave, 
      icon: FiUserX, 
      color: 'from-orange-500 to-orange-600', 
      change: 'Currently on leave',
      subtext: `${Math.round((actualOnLeave / (stats.totalEmployees || 1)) * 100)}% of workforce`
    },
    { 
      title: 'Employee of the Month', 
      value: stats.employeeOfMonth?.name || 'Not Available', 
      icon: FiAward, 
      color: 'from-yellow-500 to-yellow-600', 
      change: stats.employeeOfMonth ? `Score: ${stats.employeeOfMonth.score}%` : 'No data available',
      subtext: stats.employeeOfMonth ? `${stats.employeeOfMonth.department} • ${stats.employeeOfMonth.month}` : 'Add performance targets',
      isEmployeeCard: true
    },
    { 
      title: 'Attendance Today', 
      value: stats.totalEmployees > 0 ? `${Math.round(((stats.totalEmployees - actualOnLeave) / stats.totalEmployees) * 100)}%` : '0%', 
      icon: FiTrendingUp, 
      color: 'from-purple-500 to-purple-600', 
      change: 'Current day average',
      subtext: `${stats.totalEmployees - actualOnLeave} employees present`
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className={`stat-card group animate-slide-up ${stat.isEmployeeCard ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`} style={{ animationDelay: `${index * 100}ms` }}>
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
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg ${stat.isEmployeeCard ? 'animate-pulse' : ''}`}>
              <stat.icon className="text-white text-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(StatsCards);