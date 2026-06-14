// src/services/dataService.js
import { api } from './api';

// Storage keys (for backward compatibility)
const STORAGE_KEYS = {
  EMPLOYEES: 'employees',
  ATTENDANCE: 'attendanceData',
  PAYROLL: 'payrollData',
  LEAVE_REQUESTS: 'leaveRequests',
  PERFORMANCE_TARGETS: 'performanceTargets',
  LEAVE_SUMMARY: 'leaveSummary',
  RECENT_ACTIVITIES: 'recentActivities',
  UPCOMING_BIRTHDAYS: 'upcomingBirthdays',
  DAILY_TARGETS: 'dailyTargets'
};

// Initialize data (for backward compatibility)
export const initializeData = () => {
  
};

// Simulate API call (for testing)
export const simulateApiCall = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Action completed successfully' });
    }, 500);
  });
};

// Employee Service (using API)
export const employeeService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/employees/');
      return Array.isArray(response) ? response : (response.results || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/api/employees/${id}/`);
      return response;
    } catch (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
  },
  
  add: async (employee) => {
    const response = await api.post('/api/employees/', employee);
    return response;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/api/employees/${id}/`, data);
    return response;
  },
  
  delete: async (id) => {
    await api.delete(`/api/employees/${id}/`);
    return true;
  },
  
  getStats: async () => {
    try {
      const employees = await employeeService.getAll();
      return {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.status === 'Active').length,
        onLeave: employees.filter(e => e.status === 'On Leave').length,
      };
    } catch (error) {
      return { totalEmployees: 0, activeEmployees: 0, onLeave: 0 };
    }
  },
  
  getOverview: async () => {
    try {
      const employees = await employeeService.getAll();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const newHires = employees.filter(emp => {
        const joinDate = new Date(emp.joining_date);
        return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
      }).length;
      
      return {
        newHires: newHires || 0,
        departures: 0,
        transfers: 0,
        promotions: 0,
        percentages: {
          newHires: '+0%',
          departures: '-0%',
          transfers: '+0%',
          promotions: '+0%'
        }
      };
    } catch (error) {
      return {
        newHires: 0,
        departures: 0,
        transfers: 0,
        promotions: 0,
        percentages: {}
      };
    }
  },
  
  getUpcomingBirthdays: async () => {
    try {
      const employees = await employeeService.getAll();
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();
      
      const upcoming = employees.filter(emp => {
        if (!emp.date_of_birth) return false;
        const birthDate = new Date(emp.date_of_birth);
        const birthMonth = birthDate.getMonth();
        const birthDay = birthDate.getDate();
        
        if (birthMonth === currentMonth && birthDay >= currentDay) return true;
        if (birthMonth === currentMonth + 1 && birthDay <= currentDay + 30) return true;
        return false;
      }).slice(0, 3);
      
      return upcoming;
    } catch (error) {
      return [];
    }
  },
  
  getRecentActivities: async () => {
    try {
      const leaveService = await import('./leaveService').then(m => m.leaveService);
      const leaves = await leaveService.getAll();
      const activities = [];
      
      leaves.slice(0, 4).forEach((req, idx) => {
        activities.push({
          id: idx + 1,
          title: `${req.employee_name || 'Employee'} has applied for leave`,
          date: new Date(req.applied_on || req.from_date).toLocaleDateString(),
          description: req.leave_type || req.type,
          type: 'leave'
        });
      });
      
      return activities;
    } catch (error) {
      return [];
    }
  }
};

// Payroll Service
export const payrollService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/payroll/records/');
      return Array.isArray(response) ? response : (response.results || []);
    } catch (error) {
      console.error('Error fetching payroll:', error);
      return [];
    }
  },
  
  updateStatus: async (id, status) => {
    const response = await api.patch(`/api/payroll/records/${id}/`, { status });
    return response;
  },
  
  getStats: async () => {
    try {
      const payroll = await payrollService.getAll();
      const totalPayroll = payroll.reduce((sum, p) => sum + (p.net_salary || 0), 0);
      const paidEmployees = payroll.filter(p => p.status === 'Paid').length;
      const pendingAmount = payroll.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.net_salary || 0), 0);
      
      return {
        totalPayroll,
        paidEmployees,
        pendingCount: payroll.length - paidEmployees,
        pendingAmount
      };
    } catch (error) {
      return { totalPayroll: 0, paidEmployees: 0, pendingCount: 0, pendingAmount: 0 };
    }
  }
};

// Leave Service
export const leaveService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/leave/requests/');
      return Array.isArray(response) ? response : (response.results || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      return [];
    }
  },
  
  getSummary: async () => {
    try {
      const leaves = await leaveService.getAll();
      let annual = 0, sick = 0, personal = 0, other = 0;
      
      leaves.forEach(leave => {
        if (leave.status === 'Approved') {
          switch(leave.leave_type) {
            case 'Annual Leave': annual += leave.days || 0; break;
            case 'Sick Leave': sick += leave.days || 0; break;
            case 'Personal Leave': personal += leave.days || 0; break;
            default: other += leave.days || 0;
          }
        }
      });
      
      return { annual, sick, personal, other };
    } catch (error) {
      return { annual: 0, sick: 0, personal: 0, other: 0 };
    }
  },
  
  addRequest: async (request) => {
    const response = await api.post('/api/leave/requests/', request);
    return response;
  },
  
  updateStatus: async (id, status, remarks) => {
    const response = await api.patch(`/api/leave/requests/${id}/`, { status, remarks });
    return response;
  }
};

// Attendance Service
export const attendanceService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/attendance/records/');
      return Array.isArray(response) ? response : (response.results || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  },
  
  getCurrentMonthAttendance: async () => {
    try {
      const attendance = await attendanceService.getAll();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthAttendance = attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
      });
      
      if (monthAttendance.length === 0) return 0;
      const presentCount = monthAttendance.filter(record => record.status === 'Present').length;
      return Math.round((presentCount / monthAttendance.length) * 100);
    } catch (error) {
      return 0;
    }
  },
  
  addRecord: async (record) => {
    const response = await api.post('/api/attendance/records/', record);
    return response;
  }
};

// Performance Service
export const performanceService = {
  getAllTargets: async () => {
    try {
      const response = await api.get('/api/performance/targets/');
      return Array.isArray(response) ? response : (response.results || []);
    } catch (error) {
      console.error('Error fetching performance targets:', error);
      return [];
    }
  },
  
  getTargetsByEmployee: async (employeeId) => {
    const targets = await performanceService.getAllTargets();
    return targets.filter(t => t.employee_id === employeeId);
  },
  
  addTarget: async (target) => {
    const response = await api.post('/api/performance/targets/', target);
    return response;
  },
  
  updateTarget: async (id, data) => {
    const response = await api.put(`/api/performance/targets/${id}/`, data);
    return response;
  },
  
  deleteTarget: async (id) => {
    await api.delete(`/api/performance/targets/${id}/`);
    return true;
  },
  
  calculatePerformanceScore: (attendance, projectCompletion, taskEfficiency) => {
    return (0.4 * (attendance || 0)) + (0.4 * (projectCompletion || 0)) + (0.2 * (taskEfficiency || 0));
  },
  
  getStats: async (month) => {
    try {
      const targets = await performanceService.getAllTargets();
      const monthTargets = targets.filter(t => t.month === month);
      const totalEmployees = monthTargets.length;
      let totalScore = 0;
      let totalAttendance = 0;
      let totalCompletion = 0;
      
      monthTargets.forEach(target => {
        const completionRate = target.current_target > 0 ? (target.completed_target / target.current_target) * 100 : 0;
        totalScore += performanceService.calculatePerformanceScore(target.attendance || 0, completionRate, 0);
        totalAttendance += target.attendance || 0;
        totalCompletion += completionRate;
      });
      
      return {
        totalEmployees,
        averagePerformance: totalEmployees > 0 ? (totalScore / totalEmployees).toFixed(1) : 0,
        highestAttendance: totalEmployees > 0 ? (totalAttendance / totalEmployees).toFixed(1) : 0,
        targetCompletion: totalEmployees > 0 ? (totalCompletion / totalEmployees).toFixed(1) : 0
      };
    } catch (error) {
      return { totalEmployees: 0, averagePerformance: 0, highestAttendance: 0, targetCompletion: 0 };
    }
  }
};

// Daily Target Service
export const dailyTargetService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/performance/daily/');
      return Array.isArray(response) ? response : (response.results || []);
    } catch (error) {
      console.error('Error fetching daily targets:', error);
      return [];
    }
  },
  
  getByEmployee: async (employeeId, month) => {
    const targets = await dailyTargetService.getAll();
    return targets.filter(t => 
      t.employee_id === employeeId && 
      t.date.startsWith(month)
    );
  },
  
  update: async (id, data) => {
    const response = await api.put(`/api/performance/daily/${id}/`, data);
    return response;
  }
};

// Data Sync Service
export const dataSyncService = {
  syncNewEmployee: async (employee) => {
    // This will be handled by the backend automatically
  },
  
  syncEmployeeUpdate: async (employee) => {
    // This will be handled by the backend automatically
  },
  
  deleteEmployeeRelatedData: async (employee) => {
    // This will be handled by the backend automatically
  }
};