
import React, { useEffect, useState } from 'react';
import {
  FiMenu,
  FiBell
} from 'react-icons/fi';

import SearchBar from '../Common/SearchBar';

const Header = ({
  setSidebarOpen,
  sidebarCollapsed,
}) => {

  // LIVE DATE & TIME
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);

  }, []);

  // FORMAT DATE
  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // FORMAT TIME
  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (

    <header
      className={`
        fixed top-0 right-0 z-30 h-auto
        bg-white/90 backdrop-blur-md
        border-b border-gray-200
        transition-all duration-300

        left-0
        ${sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}
      `}
    >

      <div className="h-20 px-3 sm:px-5 flex items-center justify-between gap-4">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {/* MOBILE MENU */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100"
          >
            <FiMenu className="text-xl" />
          </button>

          {/* SEARCH */}
          <div className="hidden md:block w-[300px]">
            <SearchBar />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* DATE & TIME */}
          <div className="hidden md:flex flex-col items-end mr-2">
            
            <p className="text-sm font-semibold text-gray-800">
              {formattedTime}
            </p>

            <p className="text-xs text-gray-500">
              {formattedDate}
            </p>

          </div>

          {/* NOTIFICATION */}
          <button className="relative p-2 rounded-xl hover:bg-gray-100">
            <FiBell className="text-lg" />

            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* PROFILE */}
          <div className="flex items-center gap-3">

            <div className="hidden sm:block text-right">

              <p className="text-sm font-semibold text-gray-800">
                Brij K.
              </p>

              <p className="text-xs text-gray-500">
                HR Manager
              </p>

            </div>

            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
              BK
            </div>

          </div>
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div className="md:hidden px-3 pb-3">
        <SearchBar />
      </div>

    </header>
  );
};

export default Header;

