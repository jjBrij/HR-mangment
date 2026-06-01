
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiSettings,
  FiBriefcase,
  FiPieChart,
  FiX,
  FiChevronsLeft,
  FiChevronsRight
} from 'react-icons/fi';

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed
}) => {

  const navItems = [
    { path: '/', name: 'Dashboard', icon: FiHome },
    { path: '/employees', name: 'Employees', icon: FiUsers },
    
    { path: '/payroll', name: 'Payroll', icon: FiDollarSign },
    { path: '/attendance', name: 'Attendance', icon: FiCalendar },
    { path: '/performance', name: 'Performance', icon: FiBriefcase },
    { path: '/leave', name: 'Leave Management', icon: FiCalendar },
    { path: '/settings', name: 'Settings', icon: FiSettings },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200
        shadow-xl transition-all duration-300 ease-in-out

        ${sidebarCollapsed ? 'w-20' : 'w-64'}

        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >

      {/* DESKTOP SLIDE BUTTON */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="
          hidden lg:flex
          absolute -right-4 top-6
          w-8 h-8
          items-center justify-center
          bg-white
          border border-gray-200
          rounded-full
          shadow-md
          hover:bg-gray-100
          transition-all
          duration-300
          z-50
        "
      >
        {sidebarCollapsed ? (
          <FiChevronsRight className="text-gray-700 text-sm" />
        ) : (
          <FiChevronsLeft className="text-gray-700 text-sm" />
        )}
      </button>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        
        <div className="flex items-center gap-3 overflow-hidden">
          
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center shrink-0">
            <FiBriefcase className="text-white text-lg" />
          </div>

          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                HRMS
              </h1>

              <p className="text-xs text-gray-500">
                Dashboard
              </p>
            </div>
          )}
        </div>

        {/* Mobile Close */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setSidebarOpen(false)}
        >
          <FiX />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all

              ${isActive
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
              }

              ${sidebarCollapsed ? 'justify-center px-2' : ''}
              `
            }
          >
            <item.icon className="text-lg shrink-0" />

            {!sidebarCollapsed && (
              <span className="font-medium text-sm">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          
          <div className="bg-indigo-50 rounded-2xl p-4">
            
            <div className="flex items-center gap-2">
              <FiPieChart className="text-indigo-600" />

              <span className="text-sm font-medium">
                HRMS v2.0
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Responsive Dashboard
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

