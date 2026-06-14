// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, mustChangePassword, getCurrentUser } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const authenticated      = isAuthenticated();
  const needPasswordChange = mustChangePassword();
  const pathname           = window.location.pathname;

  // Not authenticated → login
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Must change password first
  if (needPasswordChange && pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

export default ProtectedRoute;