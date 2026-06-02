// src/App.jsx (Fixed with AppProvider)
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import Attendance from './pages/Attendance';
import Performance from './pages/Performance';
import Payroll from './pages/Payroll';
import Leave from './pages/Leave';
import Settings from './pages/Settings';
import EmployeeDashboard from './pages/EmployeeDashboard';
import { initializeData } from './services/dataService';
import { initializeAuth, getCurrentUser } from './services/authService';

function AppContent() {
  useEffect(() => {
    initializeData();
    initializeAuth();
  }, []);

  const currentUser = getCurrentUser();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/employees" element={
        <ProtectedRoute>
          <Layout>
            <Employees />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/employees/add" element={
        <ProtectedRoute>
          <Layout>
            <AddEmployee />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/employees/edit" element={
        <ProtectedRoute>
          <Layout>
            <EditEmployee />
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
      <Route path="/payroll" element={
        <ProtectedRoute>
          <Layout>
            <Payroll />
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
      <Route path="/employee-dashboard" element={
        <ProtectedRoute>
          <Layout>
            <EmployeeDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
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