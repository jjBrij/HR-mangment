import React from 'react';
import { getCurrentUser } from '../services/authService';

const EmployeeOnly = ({ children }) => {
  const currentUser = getCurrentUser();
  const isEmployee = currentUser?.role === 'employee';
  
  if (!isEmployee) return null;
  return children;
};

export default EmployeeOnly;