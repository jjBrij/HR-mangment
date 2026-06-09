// src/components/Layout/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiDollarSign, 
  FiCalendar, 
  FiSettings,
  FiBriefcase,
  FiPieChart,
  FiPhoneCall,
  FiTrendingUp,
  FiUserCheck,
  FiLogOut,
  FiX
} from 'react-icons/fi';
import { getCurrentUser, logout } from '../../services/authService';

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isAdminOrHR = currentUser?.role === 'admin' || currentUser?.role === 'hr_manager';
  const isEmployee = currentUser?.role === 'employee';

  // Navigation items for all users
  const commonNavItems = [
    { path: '/', name: 'Dashboard', icon: FiHome },
  ];

  // Employee only navigation
  const employeeNavItems = [
    { path: '/employee-dashboard', name: 'My Dashboard', icon: FiUserCheck },
    { path: '/attendance', name: 'Attendance', icon: FiCalendar },
    { path: '/leave', name: 'Leave', icon: FiPhoneCall },
    { path: '/performance', name: 'Performance', icon: FiTrendingUp },
  ];

  // Admin/HR only navigation
  const adminNavItems = [
    { path: '/employees', name: 'Employees', icon: FiUsers },
    { path: '/attendance', name: 'Attendance', icon: FiCalendar },
    { path: '/performance', name: 'Performance', icon: FiTrendingUp },
    { path: '/payroll', name: 'Payroll', icon: FiDollarSign },
    { path: '/leave', name: 'Leave', icon: FiPhoneCall },
    { path: '/employee-dashboard', name: 'My Dashboard', icon: FiUserCheck },
    { path: '/settings', name: 'Settings', icon: FiSettings },
  ];

  // Select navigation based on role
  const navItems = isAdminOrHR ? adminNavItems : employeeNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <aside className="h-full flex flex-col bg-white">
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-lg flex items-center justify-center">
            <FiBriefcase className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">HRMS</h1>
            <p className="text-xs text-gray-500 -mt-0.5">Dashboard</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-lg hover:bg-gray-100 transition md:hidden"
        >
          <FiX size={20} className="text-gray-600" />
        </button>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            {currentUser?.first_name?.charAt(0) || currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              {currentUser?.first_name} {currentUser?.last_name}
            </p>
            <p className="text-xs text-gray-500">{currentUser?.employee_id}</p>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{currentUser?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-700 mb-1 ${
                isActive ? 'active bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:text-white' : ''
              }`
            }
          >
            <item.icon className="text-lg" />
            <span className="font-medium text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-100 pt-2 pb-4 px-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 transition-all duration-200 hover:bg-red-50 mt-2"
        >
          <FiLogOut className="text-lg" />
          <span className="font-medium text-sm">Logout</span>
        </button>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="bg-indigo-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <FiPieChart className="text-indigo-600 text-sm" />
              <span className="text-xs text-gray-600">HRMS v2.0</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">© 2025 Company Inc.</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);