// src/components/Layout/Sidebar.jsx (Complete Mobile Responsive)
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
  FiX,
  FiLogOut,
  FiUser
} from 'react-icons/fi';
import { logout, getCurrentUser } from '../../services/authService';

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const navItems = [
    { path: '/', name: 'Dashboard', icon: FiHome },
    { path: '/employees', name: 'Employees', icon: FiUsers },
    { path: '/attendance', name: 'Attendance', icon: FiCalendar },
    { path: '/performance', name: 'Performance', icon: FiTrendingUp },
    { path: '/payroll', name: 'Payroll', icon: FiDollarSign },
    { path: '/leave', name: 'Leave', icon: FiPhoneCall },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const handleMyDashboard = () => {
    navigate('/employee-dashboard');
    if (onClose) onClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    if (onClose) onClose();
  };

  return (
    <aside className="h-full flex flex-col bg-white">
      {/* Header with Logo and Close Button */}
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

      {/* User Profile Section 
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{currentUser?.userId || 'N/A'}</p>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{currentUser?.role || 'Employee'}</p>
          </div>
        </div>
      </div>
*/}
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

      {/* Bottom Section - My Dashboard, Settings, Logout */}
      <div className="border-t border-gray-100 pt-2 pb-4 px-3">
        {/* My Dashboard */}
        <button
          onClick={handleMyDashboard}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-700 mb-1"
        >
          <FiUserCheck className="text-lg" />
          <span className="font-medium text-sm">My Dashboard</span>
        </button>

        {/* Settings */}
        <button
          onClick={handleSettings}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-700 mb-1"
        >
          <FiSettings className="text-lg" />
          <span className="font-medium text-sm">Settings</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 transition-all duration-200 hover:bg-red-50 mt-2"
        >
          <FiLogOut className="text-lg" />
          <span className="font-medium text-sm">Logout</span>
        </button>

        {/* Version Info */}
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