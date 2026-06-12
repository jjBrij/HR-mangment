// src/App.jsx
import React, { useEffect } from 'react';
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
import Attendance from './pages/Attendance';
import Performance from './pages/Performance';
import Payroll from './pages/Payroll';
import Leave from './pages/Leave';
import Settings from './pages/Settings';
import { initializeData } from './services/dataService';
import { initializeAuth, getCurrentUser } from './services/authService';
import EditEmployee from './pages/EditEmployee';

function AppContent() {
  useEffect(() => {
    initializeData();
    initializeAuth();
  }, []);

  const currentUser = getCurrentUser();
  const isAdminOrHR = currentUser?.role === 'admin' || currentUser?.role === 'hr_manager';

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<ChangePassword />} />

      {/* Admin/HR Only Routes */}
      <Route path="/employees" element={
        <ProtectedRoute>
          <RoleBasedLayout allowedRoles={['admin', 'hr_manager']}>
            <Layout>
              <Employees />
            </Layout>
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      <Route path="/employees/add" element={
        <ProtectedRoute>
          <RoleBasedLayout allowedRoles={['admin', 'hr_manager']}>
            <Layout>
              <AddEmployee />
            </Layout>
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      <Route path="/employees/edit/:id" element={
        <ProtectedRoute>
          <RoleBasedLayout allowedRoles={['admin', 'hr_manager']}>
            <Layout>
              <EditEmployee />
            </Layout>
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      <Route path="/payroll" element={
        <ProtectedRoute>
          <RoleBasedLayout allowedRoles={['admin', 'hr_manager']}>
            <Layout>
              <Payroll />
            </Layout>
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <RoleBasedLayout allowedRoles={['admin', 'hr_manager']}>
            <Layout>
              <Settings />
            </Layout>
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      {/* Routes accessible by both Admin/HR and Employees */}
      <Route path="/" element={
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <RoleBasedLayout allowedRoles={['admin', 'hr_manager']}>
            <Layout>
              <Dashboard />
            </Layout>
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      <Route path="/employee-dashboard" element={
        <ProtectedRoute>
          <RoleBasedLayout allowedRoles={['employee']}>
            <Layout>
              <EmployeeDashboard />
            </Layout>
          </RoleBasedLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/employee-dashboard" element={
        <ProtectedRoute>
          <Layout>
            <EmployeeDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/attendance" element={
        <ProtectedRoute>
          <Layout>
            <Attendance />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/performance" element={
        <ProtectedRoute>
          <Layout>
            <Performance />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/leave" element={
        <ProtectedRoute>
          <Layout>
            <Leave />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Catch all - redirect based on role */}
      <Route path="*" element={
        <Navigate to={isAdminOrHR ? "/dashboard" : "/employee-dashboard"} replace />
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