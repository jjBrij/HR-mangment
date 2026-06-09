// src/pages/Dashboard.jsx
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { getCurrentUser } from '../services/authService';
import StatsCards from '../components/Dashboard/StatsCards';
import EmployeeOverview from '../components/Dashboard/EmployeeOverview';
import UpcomingBirthdays from '../components/Dashboard/UpcomingBirthdays';
import RecentActivities from '../components/Dashboard/RecentActivities';
import LeaveSummary from '../components/Dashboard/LeaveSummary';

const Dashboard = () => {
  const { getDashboardStats, isLoading } = useAppContext();
  const currentUser = getCurrentUser();
  const stats = getDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Welcome back, {currentUser?.first_name || 'Admin'}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your workforce today.</p>
      </div>
      
      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <EmployeeOverview />
          <RecentActivities />
        </div>
        <div className="space-y-6">
          <UpcomingBirthdays />
          <LeaveSummary />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;