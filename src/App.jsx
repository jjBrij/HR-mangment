// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import RoleBasedLayout from './components/Layout/RoleBasedLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import Attendance from './pages/Attendance';
import Performance from './pages/Performance';
import Payroll from './pages/Payroll';
import Leave from './pages/Leave';
import ResetPassword from './pages/ResetPassword';

import Settings from './pages/Settings';
import { initializeData } from './services/dataService';
import { initializeAuth, getCurrentUser } from './services/authService';

// Reads role fresh on every render — no stale closure
const getHomeRoute = () => {
  const user = getCurrentUser();
  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr_manager';
  return isAdminOrHR ? '/dashboard' : '/employee-dashboard';
};

// Smart redirect component — always reads localStorage at render time
const RoleRedirect = () => {
  return <Navigate to={getHomeRoute()} replace />;
};

function AppContent() {
  // Re-render trigger so routes update after login sets localStorage
  const [, setAuthReady] = useState(false);

  useEffect(() => {
    initializeData();
    initializeAuth();
    // Force a re-render after init so getCurrentUser() has fresh data
    setAuthReady(true);
  }, []);

  return (
    <Routes>
      {/* ── Public ──────────────────────────────────────────────────────── */}
      <Route path="/login"           element={<Login />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />


      {/* ── Root → smart role redirect ───────────────────────────────────── */}
      <Route path="/" element={
        <ProtectedRoute>
          <RoleRedirect />
        </ProtectedRoute>
      } />

      {/* ── Admin / HR only ─────────────────────────────────────────────── */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {/*<RoleBasedLayout allowedRoles={['admin', 'hr_manager',]}>*/}
            <Layout><Dashboard /></Layout>
  
        </ProtectedRoute>
      } />

      <Route path="/employees" element={
        <ProtectedRoute>
          <RoleBasedLayout allowedRoles={['admin', 'hr_manager']}>
            <Layout><Employees /></Layout>
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      <Route path="/employees/add" element={
        <ProtectedRoute>
          <RoleBasedLayout allowedRoles={['admin', 'hr_manager']}>
            <Layout><AddEmployee /></Layout>
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      <Route path="/employees/edit/:id" element={
        <ProtectedRoute>
          <RoleBasedLayout allowedRoles={['admin', 'hr_manager']}>
            <Layout><EditEmployee /></Layout>
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      <Route path="/payroll" element={
        <ProtectedRoute>
          <RoleBasedLayout allowedRoles={['admin', 'hr_manager']}>
            <Layout><Payroll /></Layout>
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <RoleBasedLayout allowedRoles={['admin', 'hr_manager']}>
            <Layout><Settings /></Layout>
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      {/* ── Employee only ────────────────────────────────────────────────── */}
      <Route path="/employee-dashboard" element={
        <ProtectedRoute>
          <RoleBasedLayout allowedRoles={['employee']}>
            <Layout><EmployeeDashboard /></Layout>
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      {/* ── Shared (all roles) ───────────────────────────────────────────── */}
      <Route path="/attendance" element={
        <ProtectedRoute>
          <Layout><Attendance /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/performance" element={
        <ProtectedRoute>
          <Layout><Performance /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/leave" element={
        <ProtectedRoute>
          <Layout><Leave /></Layout>
        </ProtectedRoute>
      } />

      {/* ── Catch-all ────────────────────────────────────────────────────── */}
      <Route path="*" element={
        <ProtectedRoute>
          <RoleRedirect />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

export default App;