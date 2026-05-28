// src/components/Layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiDollarSign, 
  FiCalendar, 
  FiSettings,
  FiBriefcase,
  FiPieChart
} from 'react-icons/fi';

// Sidebar navigation component with routes
const Sidebar = () => {
  const navItems = [
    { path: '/', name: 'Dashboard', icon: FiHome },
    { path: '/employees', name: 'Employees', icon: FiUsers },
    { path: '/payroll', name: 'Payroll', icon: FiDollarSign },
    {path: '/attendance', name: 'Attendance', icon: FiCalendar }  ,
    { path: '/performance', name: 'Performance', icon: FiBriefcase },
    { path: '/leave', name: 'Leave Management', icon: FiCalendar },
    { path: '/settings', name: 'Settings', icon: FiSettings },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 shadow-lg transition-transform duration-300">
      {/* Logo Section */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-lg flex items-center justify-center">
          <FiBriefcase className="text-white text-lg" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">HRMS</h1>
          <p className="text-xs text-gray-500 -mt-0.5">Dashboard</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active bg-indigo-600 text-white shadow-md' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'}`
            }
          >
            <item.icon className="text-lg" />
            <span className="font-medium text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section - System Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        <div className="bg-indigo-50 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <FiPieChart className="text-indigo-600" />
            <span className="text-xs text-gray-600">HRMS v2.0</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">© 2025 Company Inc.</p>
        </div>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar); // Memoized for performance