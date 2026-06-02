// src/components/Layout/Header.jsx (Mobile Responsive)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiUser, FiChevronDown, FiSearch, FiSun, FiLogOut, FiSettings, FiUserCheck, FiMenu } from 'react-icons/fi';
import { getCurrentUser, logout } from '../../services/authService';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    try {
      const user = getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      setCurrentUser(null);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfileMenu(false);
  };

  const handleProfileClick = () => {
    navigate('/employee-dashboard');
    setShowProfileMenu(false);
  };

  const handleSettings = () => {
    navigate('/settings');
    setShowProfileMenu(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  if (showSearchMobile) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-white z-50 p-4 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSearchMobile(false)} className="p-2">
            <FiChevronDown className="transform rotate-90" size={20} />
          </button>
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees, departments..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
              autoFocus
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <header className={`
      fixed right-0 top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-200
      ${isMobile ? 'left-0' : 'md:left-64'}
    `}>
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Mobile Menu Button */}
        {isMobile && (
          <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <FiMenu size={22} className="text-gray-600" />
          </button>
        )}

        {/* Search Bar - Desktop */}
        <div className="hidden md:block flex-1 max-w-md">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees, departments..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Search Button */}
          {isMobile && (
            <button onClick={() => setShowSearchMobile(true)} className="p-2 text-gray-600 rounded-lg hover:bg-gray-100">
              <FiSearch size={20} />
            </button>
          )}

          {/* Weather/Time Widget - Hide on mobile */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-full">
            <FiSun className="text-yellow-500" />
            <span className="text-sm font-medium">40°C Sunny</span>
            <div className="w-px h-4 bg-gray-300"></div>
            <span className="text-sm text-gray-600">{currentTime}</span>
            <span className="text-xs text-gray-400">{currentDate}</span>
          </div>

          {/* Language - Hide on small mobile */}
          <button className="hidden sm:block px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition">
            ENG
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <FiBell className="text-lg md:text-xl" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Menu */}
          <div className="relative profile-menu-container">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1 md:gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-semibold">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser?.role || 'Employee'}</p>
              </div>
              <FiChevronDown className="text-gray-400 text-xs md:text-sm hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 md:w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">{currentUser?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-500">{currentUser?.userId || 'N/A'}</p>
                  <p className="text-xs text-gray-400 mt-1 truncate">{currentUser?.email || 'Not logged in'}</p>
                </div>
                <button
                  onClick={handleProfileClick}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition flex items-center gap-3"
                >
                  <FiUserCheck size={16} className="text-indigo-600" />
                  My Dashboard
                </button>
                <button
                  onClick={handleSettings}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition flex items-center gap-3"
                >
                  <FiSettings size={16} className="text-gray-600" />
                  Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);