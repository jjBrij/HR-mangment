

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Header */}
      <Header
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* PAGE CONTENT */}
      <div
        className={`
          transition-all duration-300
          pt-[120px]
          lg:pt-24

          ${sidebarCollapsed
            ? 'lg:ml-20'
            : 'lg:ml-64'
          }
        `}
      >
        <main className="p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

