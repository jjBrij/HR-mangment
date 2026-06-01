// src/context/AppContext.jsx (Updated)
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { employeeService, payrollService, leaveService, attendanceService } from '../services/dataService';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [performanceTargets, setPerformanceTargets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper: Clean array
  const cleanArray = useCallback((arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.filter(item => {
      if (item == null) return false;
      if (typeof item !== 'object') return false;
      return Object.keys(item).length > 0 && (item.id || item.employeeId);
    });
  }, []);

  // Calculate performance score
  const calculatePerformanceScore = (attendance, projectCompletion, taskEfficiency) => {
    return (0.4 * attendance) + (0.4 * projectCompletion) + (0.2 * taskEfficiency);
  };

  // Get Employee of the Month (Top performer)
  const getEmployeeOfTheMonth = useCallback(() => {
    const targets = performanceTargets;
    if (!targets || targets.length === 0) return null;
    
    // Get current month's targets
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthTargets = targets.filter(t => t.month === currentMonth);
    
    if (currentMonthTargets.length === 0) return null;
    
    // Calculate scores and find top performer
    const employeesWithScore = currentMonthTargets.map(target => {
      const score = calculatePerformanceScore(
        target.attendance || 0, 
        target.projectCompletion || 0, 
        target.taskEfficiency || 0
      );
      return {
        ...target,
        performanceScore: score
      };
    });
    
    const sorted = employeesWithScore.sort((a, b) => b.performanceScore - a.performanceScore);
    const topEmployee = sorted[0];
    
    if (topEmployee) {
      return {
        name: topEmployee.employeeName,
        employeeId: topEmployee.employeeId,
        department: topEmployee.department,
        score: topEmployee.performanceScore.toFixed(0),
        month: currentMonth
      };
    }
    
    return null;
  }, [performanceTargets]);

  // Calculate stats from cleaned data
  const calculateStats = useCallback((employeeData, leaveData, payrollData) => {
    const validEmployees = cleanArray(employeeData);
    const validLeaves = cleanArray(leaveData);
    const validPayroll = cleanArray(payrollData);

    const activeEmployees = validEmployees.filter(e => e.status === 'Active').length;
    const onLeaveNow = validLeaves.filter(l => 
      l.status === 'Approved' && 
      new Date(l.startDate) <= new Date() && 
      new Date(l.endDate) >= new Date()
    ).length;

    const monthlyPayroll = validPayroll
      .filter(p => p.status === 'Processed')
      .reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0);

    return {
      totalEmployees: validEmployees.length,
      activeEmployees,
      onLeave: onLeaveNow,
      payroll: monthlyPayroll,
      attendance: validEmployees.length > 0 ? Math.round(((validEmployees.length - onLeaveNow) / validEmployees.length) * 100) : 0,
      monthlyGrowth: 0
    };
  }, [cleanArray]);

  // Load all data
  const loadAllData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const employeeData = employeeService.getAll();
      const payrollData = payrollService.getAll();
      const leaveData = leaveService.getAll();
      const attendanceData = attendanceService.getAll();
      const performanceData = localStorage.getItem('performanceTargets');
      let performanceList = performanceData ? JSON.parse(performanceData) : [];

      // Clean data
      const cleanEmployees = cleanArray(employeeData);
      const cleanPayroll = cleanArray(payrollData);
      const cleanLeaves = cleanArray(leaveData);
      const cleanAttendance = cleanArray(attendanceData);
      const cleanPerformance = cleanArray(performanceList);

      setEmployees(cleanEmployees);
      setPayroll(cleanPayroll);
      setLeaveRequests(cleanLeaves);
      setAttendanceRecords(cleanAttendance);
      setPerformanceTargets(cleanPerformance);

      // Calculate stats
      const stats = calculateStats(cleanEmployees, cleanLeaves, cleanPayroll);
      const employeeOfMonth = getEmployeeOfTheMonth();
      
      setDashboardStats({
        ...stats,
        employeeOfMonth: employeeOfMonth
      });

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [cleanArray, calculateStats, getEmployeeOfTheMonth]);

  // Initial load + refresh
  useEffect(() => {
    loadAllData();
  }, [refreshTrigger, loadAllData]);

  // Listen for storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && (e.key.includes('employees') || e.key.includes('payroll') || e.key.includes('leave') || e.key.includes('performance'))) {
        setRefreshTrigger(prev => prev + 1);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // CRUD Operations
  const addEmployee = useCallback((employeeData) => {
    try {
      const newEmployee = employeeService.add(employeeData);
      refreshData();
      return newEmployee;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [refreshData]);

  const updateEmployee = useCallback((id, employeeData) => {
    try {
      const updated = employeeService.update(id, employeeData);
      refreshData();
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [refreshData]);

  const deleteEmployee = useCallback((id) => {
    try {
      const remaining = employeeService.delete(id);
      refreshData();
      return remaining;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [refreshData]);

  const updatePayrollStatus = useCallback((id, status) => {
    try {
      const updated = payrollService.updateStatus(id, status);
      refreshData();
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [refreshData]);

  const addLeaveRequest = useCallback((leaveData) => {
    try {
      const newLeave = leaveService.addRequest(leaveData);
      refreshData();
      return newLeave;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [refreshData]);

  const updateLeaveStatus = useCallback((id, status, remarks) => {
    try {
      const updated = leaveService.updateStatus(id, status, remarks);
      refreshData();
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [refreshData]);

  const addAttendanceRecord = useCallback((record) => {
    try {
      const newRecord = attendanceService.addRecord(record);
      refreshData();
      return newRecord;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [refreshData]);

  // Derived state
  const activeEmployees = useMemo(() => 
    employees.filter(e => e.status === 'Active'), 
    [employees]
  );

  const pendingLeaveRequests = useMemo(() => 
    leaveRequests.filter(l => l.status === 'Pending'),
    [leaveRequests]
  );

  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    payroll: 0,
    attendance: 0,
    monthlyGrowth: 0,
    employeeOfMonth: null
  });

  const contextValue = useMemo(() => ({
    employees,
    payroll,
    leaveRequests,
    attendanceRecords,
    performanceTargets,
    dashboardStats,
    isLoading,
    error,
    activeEmployees,
    pendingLeaveRequests,
    refreshData,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updatePayrollStatus,
    addLeaveRequest,
    updateLeaveStatus,
    addAttendanceRecord,
    clearError: () => setError(null)
  }), [
    employees, payroll, leaveRequests, attendanceRecords, performanceTargets, dashboardStats,
    isLoading, error, activeEmployees, pendingLeaveRequests,
    refreshData, addEmployee, updateEmployee, deleteEmployee,
    updatePayrollStatus, addLeaveRequest, updateLeaveStatus, addAttendanceRecord
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};