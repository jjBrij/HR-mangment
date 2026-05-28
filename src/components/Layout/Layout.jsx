// src/components/Layout/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

// Main layout wrapper that combines sidebar and header
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="pt-20 px-4 md:px-6 pb-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;