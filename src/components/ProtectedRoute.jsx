// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, mustChangePassword } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  const needPasswordChange = mustChangePassword();
  const pathname = window.location.pathname;
  
  console.log('ProtectedRoute check:', { authenticated, needPasswordChange, pathname });
  
  // Not authenticated -> go to login
  if (!authenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Needs password change and not already on change-password page -> redirect
  if (needPasswordChange && pathname !== '/change-password') {
    console.log('Need password change, redirecting to change-password');
    return <Navigate to="/change-password" replace />;
  }
  
  // If authenticated and on root or dashboard, show children
  return children;
};

export default ProtectedRoute;