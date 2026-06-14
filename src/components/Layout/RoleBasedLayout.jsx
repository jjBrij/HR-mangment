// src/components/Layout/RoleBasedLayout.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';

const RoleBasedLayout = ({ children, allowedRoles = [] }) => {
  const currentUser = getCurrentUser();
  const role = currentUser?.role;

  // Role is allowed — render normally
  if (role && allowedRoles.includes(role)) {
    return children;
  }

  // Employee hitting an admin route → go to employee dashboard
  if (role === 'employee') {
    return <Navigate to="/employee-dashboard" replace />;
  }

  // Admin/HR hitting employee route → go to main dashboard
  if (role === 'admin' || role === 'hr_manager') {
    return <Navigate to="/dashboard" replace />;
  }

  // No role at all → login
  return <Navigate to="/login" replace />;
};

export default RoleBasedLayout;