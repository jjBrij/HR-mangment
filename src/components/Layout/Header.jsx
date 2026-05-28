// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import { FiBell, FiUser, FiChevronDown, FiSearch, FiSun } from 'react-icons/fi';
import SearchBar from '../Common/SearchBar';

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="fixed right-0 top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-200" style={{ left: '16rem' }}>
      <div className="flex items-center justify-between px-6 py-3">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Weather/Time Widget */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-full">
            <FiSun className="text-yellow-500" />
            <span className="text-sm font-medium">40°C Sunny</span>
            <div className="w-px h-4 bg-gray-300"></div>
            <span className="text-sm text-gray-600">{currentTime}</span>
            <span className="text-xs text-gray-400">{currentDate}</span>
          </div>

          {/* Language */}
          <button className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition">
            ENG
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <FiBell className="text-lg" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                BJ
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">Brij K.</p>
                <p className="text-xs text-gray-500">HR Manager</p>
              </div>
              <FiChevronDown className="text-gray-400 text-sm" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in">
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition">Profile</button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition">Account Settings</button>
                <hr className="my-1" />
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);