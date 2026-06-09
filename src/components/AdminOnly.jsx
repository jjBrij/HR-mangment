// src/components/AdminOnly.jsx - Component to hide content from employees
import React from 'react';
import { getCurrentUser } from '../services/authService';

const AdminOnly = ({ children }) => {
  const currentUser = getCurrentUser();
  const isAdminOrHR = currentUser?.role === 'admin' || currentUser?.role === 'hr_manager';
  
  if (!isAdminOrHR) return null;
  return children;
};

export default AdminOnly;