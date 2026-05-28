// src/pages/Dashboard.jsx
import React from 'react';
import StatsCards from '../components/Dashboard/StatsCards';
import EmployeeOverview from '../components/Dashboard/EmployeeOverview';
import UpcomingBirthdays from '../components/Dashboard/UpcomingBirthdays';
import RecentActivities from '../components/Dashboard/RecentActivities';
import LeaveSummary from '../components/Dashboard/LeaveSummary';

// Main Dashboard Page - Combines all dashboard components
const Dashboard = () => {
  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome back, Brij! 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your workforce today.</p>
      </div>
      
      {/* Stats Cards */}
      <StatsCards />
      
      {/* Two Column Layout */}
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