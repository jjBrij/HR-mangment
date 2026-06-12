// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api, getAccessToken } from '../services/api';
import { getCurrentUser } from '../services/authService';


const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [performanceTargets, setPerformanceTargets] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // const currentUser = getCurrentUser();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  useEffect(() => {
    const handleAuthChange = () => {
      loadAllData();
    };

    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      return () => window.removeEventListener("data-ready", handle);

    };
  }, []);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load employees
      const employeesRes = await api.get('/api/employees/');
      const employeesList = Array.isArray(employeesRes) ? employeesRes :
        (employeesRes.results ? employeesRes.results : []);
      setEmployees(employeesList);

      // Load performance targets
      const performanceRes = await api.get('/api/performance/targets/');
      const targetsList = Array.isArray(performanceRes) ? performanceRes :
        (performanceRes.results ? performanceRes.results : []);
      setPerformanceTargets(targetsList);
      // console.log('Performance targets loaded:', targetsList.length);

      // Load leave requests
      //const leaveRes = await api.get('/api/leave/requests/');
      //const leaveList = Array.isArray(leaveRes) ? leaveRes : 
      //        (leaveRes.results ? leaveRes.results : []);
      // setLeaveRequests(leaveList);
      // console.log('Leave requests loaded:', leaveList.length);
      setLeaveRequests([]);


    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    loadAllData();
  }, [refreshTrigger]);


  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Calculate dashboard statistics from real data
  const getDashboardStats = useCallback(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'Active').length;

    // Calculate on leave today
    const today = new Date().toISOString().split('T')[0];
    const onLeaveToday = leaveRequests.filter(leave =>
      leave.status === 'Approved' &&
      leave.from_date <= today &&
      leave.to_date >= today
    ).length;

    // Calculate new hires this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newHires = employees.filter(emp => {
      const joinDate = new Date(emp.joining_date);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;

    // Calculate attendance
    const attendance = totalEmployees > 0
      ? Math.round(((totalEmployees - onLeaveToday) / totalEmployees) * 100)
      : 0;

    return {
      totalEmployees,
      activeEmployees,
      onLeave: onLeaveToday,
      newHires,
      attendance,
      monthlyGrowth: totalEmployees > 0 ? Math.round((newHires / totalEmployees) * 100) : 0
    };
  }, [employees, leaveRequests]);

  // Get current employee (logged in user)
  const getCurrentEmployee = useCallback(() => {
    if (!currentUser) return null;
    return employees.find(emp => emp.employee_id === currentUser.employee_id);
  }, [employees, currentUser]);

  // Get performance target for employee
  const getPerformanceTarget = useCallback((employeeId, month) => {
    return performanceTargets.find(t => t.employee_id === employeeId && t.month === month);
  }, [performanceTargets]);

  // Get recent activities
  const getRecentActivities = useCallback(() => {
    const activities = [];

    // Add leave activities
    leaveRequests.slice(0, 3).forEach(leave => {
      activities.push({
        id: `leave-${leave.id}`,
        title: `${leave.employee_name || 'Employee'} has applied for leave`,
        date: new Date(leave.applied_on || leave.from_date).toLocaleDateString(),
        description: leave.leave_type || leave.type,
        type: 'leave'
      });
    });

    // Add new hire activities
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentHires = employees.filter(emp => {
      const joinDate = new Date(emp.joining_date);
      return joinDate >= thirtyDaysAgo;
    }).slice(0, 2);

    recentHires.forEach(emp => {
      activities.push({
        id: `hire-${emp.id}`,
        title: `${emp.name} has joined the company`,
        date: new Date(emp.joining_date).toLocaleDateString(),
        description: emp.position,
        type: 'hire'
      });
    });

    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [employees, leaveRequests]);

  // Get upcoming birthdays
  const getUpcomingBirthdays = useCallback(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    const birthdays = employees.filter(emp => {
      if (!emp.date_of_birth) return false;
      const birthDate = new Date(emp.date_of_birth);
      const birthMonth = birthDate.getMonth();
      const birthDay = birthDate.getDate();

      if (birthMonth === currentMonth && birthDay >= currentDay) return true;
      if (birthMonth === currentMonth + 1 && birthDay <= currentDay + 30) return true;
      return false;
    }).slice(0, 3);

    return birthdays;
  }, [employees]);

  const value = useMemo(() => ({
    employees,
    performanceTargets,
    leaveRequests,
    isLoading,
    error,
    refreshData,
    getDashboardStats,
    getCurrentEmployee,
    getPerformanceTarget,
    getRecentActivities,
    getUpcomingBirthdays,
  }), [
    employees,
    performanceTargets,
    leaveRequests,
    isLoading,
    error,
    getDashboardStats,
    getCurrentEmployee,
    getPerformanceTarget,
    getRecentActivities,
    getUpcomingBirthdays
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};