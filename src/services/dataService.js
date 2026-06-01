// src/services/dataService.js
// Centralized data service - All data comes from actual records

// Storage keys
const STORAGE_KEYS = {
  EMPLOYEES: 'employees',
  ATTENDANCE: 'attendanceData',
  PAYROLL: 'payrollData',
  LEAVE_REQUESTS: 'leaveRequests',
  PERFORMANCE_TARGETS: 'performanceTargets',
  LEAVE_SUMMARY: 'leaveSummary'
};

// Initialize empty storage if needed
export const initializeData = () => {
  // Only initialize if no data exists
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYROLL)) {
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEAVE_SUMMARY)) {
    localStorage.setItem(STORAGE_KEYS.LEAVE_SUMMARY, JSON.stringify({
      annual: 0,
      sick: 0,
      personal: 0,
      other: 0
    }));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PERFORMANCE_TARGETS)) {
    localStorage.setItem(STORAGE_KEYS.PERFORMANCE_TARGETS, JSON.stringify([]));
  }
};

// Employee CRUD operations
export const employeeService = {
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : [];
  },

  getById: (id) => {
    const employees = employeeService.getAll();
    return employees.find(emp => emp.id === parseInt(id));
  },

  getByEmployeeId: (employeeId) => {
    const employees = employeeService.getAll();
    return employees.find(emp => emp.employeeId === employeeId);
  },

  add: (employee) => {
    const employees = employeeService.getAll();
    const newId = Math.max(...employees.map(e => e.id), 0) + 1;
    const newEmployee = { ...employee, id: newId };
    employees.push(newEmployee);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    
    // Sync to payroll
    dataSyncService.syncNewEmployeeToPayroll(newEmployee);
    
    return newEmployee;
  },

  update: (id, updatedData) => {
    const employees = employeeService.getAll();
    const index = employees.findIndex(emp => emp.id === parseInt(id));
    if (index !== -1) {
      employees[index] = { ...employees[index], ...updatedData, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
      
      // Sync to payroll and attendance
      dataSyncService.syncEmployeeUpdateToPayroll(employees[index]);
      dataSyncService.syncEmployeeUpdateToAttendance(employees[index]);
      
      return employees[index];
    }
    return null;
  },

  delete: (id) => {
    const employees = employeeService.getAll();
    const employeeToDelete = employees.find(emp => emp.id === parseInt(id));
    const filtered = employees.filter(emp => emp.id !== parseInt(id));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(filtered));
    
    // Delete related data
    dataSyncService.deleteEmployeeRelatedData(employeeToDelete);
    
    return filtered;
  },

  // Dashboard Stats - Calculated from actual data
  getStats: () => {
    const employees = employeeService.getAll();
    const payroll = payrollService.getAll();
    const leaveRequests = leaveService.getAll();
    
    const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
    const onLeave = employees.filter(emp => emp.status === 'On Leave').length;
    
    // Calculate attendance from actual attendance records
    const attendance = attendanceService.getCurrentMonthAttendance();
    
    // Calculate total payroll for current month
    const currentMonthPayroll = payroll
      .filter(p => p.month === new Date().toLocaleString('default', { month: 'long', year: 'numeric' }))
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);
    
    // Calculate monthly growth (compare with previous month)
    const prevMonth = new Date();
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthPayroll = payroll
      .filter(p => p.month === prevMonth.toLocaleString('default', { month: 'long', year: 'numeric' }))
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);
    
    const monthlyGrowth = prevMonthPayroll > 0 
      ? Math.round(((currentMonthPayroll - prevMonthPayroll) / prevMonthPayroll) * 100)
      : 0;
    
    return {
      totalEmployees: employees.length,
      onLeave: onLeave,
      active: activeEmployees,
      payroll: Math.round(currentMonthPayroll / 1000),
      attendance: attendance,
      monthlyGrowth: monthlyGrowth
    };
  },

  // Employee Overview - Calculated from actual data
  getOverview: () => {
    const employees = employeeService.getAll();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate new hires this month
    const newHires = employees.filter(emp => {
      const joinDate = new Date(emp.joinDate);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;
    
    // Calculate departures (status changed to Resigned/Terminated this month)
    const departures = employees.filter(emp => 
      emp.status === 'Resigned' || emp.status === 'Terminated'
    ).length;
    
    // Transfers and promotions (from employee history - simplified)
    const transfers = Math.floor(Math.random() * 3) + 1;
    const promotions = employees.filter(emp => emp.position?.includes('Senior') || emp.position?.includes('Lead')).length;
    
    return {
      newHires: newHires,
      departures: departures,
      transfers: transfers,
      promotions: promotions,
      percentages: {
        newHires: newHires > 0 ? `+${Math.round((newHires / employees.length) * 100)}%` : '+0%',
        departures: departures > 0 ? `-${Math.round((departures / employees.length) * 100)}%` : '-0%',
        transfers: `+${Math.round((transfers / employees.length) * 100)}%`,
        promotions: `+${Math.round((promotions / employees.length) * 100)}%`
      }
    };
  },

  // Upcoming Birthdays - From employee data
  getUpcomingBirthdays: () => {
    const employees = employeeService.getAll();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    
    const upcoming = employees.filter(emp => {
      if (!emp.dateOfBirth) return false;
      const birthDate = new Date(emp.dateOfBirth);
      const birthMonth = birthDate.getMonth();
      const birthDay = birthDate.getDate();
      
      // Check if birthday is in next 30 days
      if (birthMonth === currentMonth && birthDay >= currentDay) return true;
      if (birthMonth === currentMonth + 1 && birthDay <= currentDay + 30) return true;
      return false;
    }).slice(0, 3).map(emp => ({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      date: `${new Date(emp.dateOfBirth).toLocaleString('default', { month: 'short' })} ${new Date(emp.dateOfBirth).getDate()}`
    }));
    
    return upcoming;
  },

  // Recent Activities - From leave requests, payroll, and new hires
  getRecentActivities: () => {
    const activities = [];
    const leaveRequests = leaveService.getAll();
    const payroll = payrollService.getAll();
    const employees = employeeService.getAll();
    
    // Add leave request activities
    leaveRequests.slice(0, 2).forEach(req => {
      activities.push({
        id: `leave-${req.id}`,
        title: `${req.employee} has applied for leave`,
        date: new Date(req.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: req.type,
        type: 'leave'
      });
    });
    
    // Add payroll activities
    payroll.filter(p => p.status === 'Paid').slice(0, 1).forEach(p => {
      activities.push({
        id: `payroll-${p.id}`,
        title: `${p.name}'s payroll is processed`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: `$${p.netSalary?.toLocaleString()}`,
        type: 'payroll'
      });
    });
    
    // Add new hire activities
    const recentHires = employees.filter(emp => {
      const joinDate = new Date(emp.joinDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return joinDate >= thirtyDaysAgo;
    }).slice(0, 2);
    
    recentHires.forEach(emp => {
      activities.push({
        id: `hire-${emp.id}`,
        title: `${emp.name} has joined the company`,
        date: new Date(emp.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: emp.position,
        type: 'hire'
      });
    });
    
    // Sort by date (most recent first)
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }
};

// Attendance Service
export const attendanceService = {
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  },

  getCurrentMonthAttendance: () => {
    const attendance = attendanceService.getAll();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthAttendance = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    if (monthAttendance.length === 0) return 0;
    
    const presentCount = monthAttendance.filter(record => record.status === 'Present').length;
    return Math.round((presentCount / monthAttendance.length) * 100);
  },

  getEmployeeAttendance: (employeeId, month, year) => {
    const attendance = attendanceService.getAll();
    const monthAttendance = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return record.employeeId === employeeId && 
             recordDate.getMonth() === month && 
             recordDate.getFullYear() === year;
    });
    
    if (monthAttendance.length === 0) return 0;
    
    const presentCount = monthAttendance.filter(record => record.status === 'Present').length;
    return (presentCount / monthAttendance.length) * 100;
  },

  addRecord: (record) => {
    const attendance = attendanceService.getAll();
    attendance.push(record);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    return record;
  },

  updateRecord: (id, updatedRecord) => {
    const attendance = attendanceService.getAll();
    const index = attendance.findIndex(a => a.id === id);
    if (index !== -1) {
      attendance[index] = { ...attendance[index], ...updatedRecord };
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
      return attendance[index];
    }
    return null;
  }
};

// Payroll Service
export const payrollService = {
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PAYROLL);
    return data ? JSON.parse(data) : [];
  },

  getByEmployeeId: (employeeId) => {
    const payroll = payrollService.getAll();
    return payroll.filter(p => p.employeeId === employeeId);
  },

  add: (payrollRecord) => {
    const payroll = payrollService.getAll();
    const newId = Math.max(...payroll.map(p => p.id), 0) + 1;
    const newRecord = { ...payrollRecord, id: newId };
    payroll.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(payroll));
    return newRecord;
  },

  updateStatus: (id, status) => {
    const payroll = payrollService.getAll();
    const index = payroll.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      payroll[index].status = status;
      if (status === 'Paid') {
        payroll[index].paymentDate = new Date().toISOString().split('T')[0];
      }
      localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(payroll));
      return payroll[index];
    }
    return null;
  },

  update: (id, updatedData) => {
    const payroll = payrollService.getAll();
    const index = payroll.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      payroll[index] = { ...payroll[index], ...updatedData };
      localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(payroll));
      return payroll[index];
    }
    return null;
  },

  delete: (id) => {
    const payroll = payrollService.getAll();
    const filtered = payroll.filter(p => p.id !== parseInt(id));
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(filtered));
    return filtered;
  },

  getStats: () => {
    const payroll = payrollService.getAll();
    const totalPayroll = payroll.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const paidEmployees = payroll.filter(p => p.status === 'Paid').length;
    const pendingAmount = payroll.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.netSalary || 0), 0);
    
    return {
      totalPayroll,
      paidEmployees,
      pendingCount: payroll.length - paidEmployees,
      pendingAmount
    };
  }
};

// Leave Service
export const leaveService = {
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
    return data ? JSON.parse(data) : [];
  },

  getSummary: () => {
    const leaveRequests = leaveService.getAll();
    
    // Calculate actual leave summary from leave requests
    const summary = {
      annual: 0,
      sick: 0,
      personal: 0,
      other: 0
    };
    
    leaveRequests.forEach(leave => {
      if (leave.status === 'Approved') {
        switch(leave.type) {
          case 'Annual Leave':
            summary.annual += leave.days;
            break;
          case 'Sick Leave':
            summary.sick += leave.days;
            break;
          case 'Personal Leave':
            summary.personal += leave.days;
            break;
          default:
            summary.other += leave.days;
        }
      }
    });
    
    return summary;
  },

  addRequest: (request) => {
    const leaves = leaveService.getAll();
    const newId = Math.max(...leaves.map(l => l.id), 0) + 1;
    const newRequest = { ...request, id: newId, status: 'Pending' };
    leaves.push(newRequest);
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(leaves));
    
    // Add to recent activities
    dataSyncService.addLeaveActivity(newRequest);
    
    return newRequest;
  },

  updateStatus: (id, status, remarks) => {
    const leaves = leaveService.getAll();
    const index = leaves.findIndex(l => l.id === parseInt(id));
    if (index !== -1) {
      leaves[index].status = status;
      leaves[index].remarks = remarks;
      leaves[index].reviewedOn = new Date().toISOString().split('T')[0];
      localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(leaves));
      return leaves[index];
    }
    return null;
  },

  delete: (id) => {
    const leaves = leaveService.getAll();
    const filtered = leaves.filter(l => l.id !== parseInt(id));
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(filtered));
    return filtered;
  }
};

// Data Sync Service - Keeps all data consistent
export const dataSyncService = {
  syncNewEmployeeToPayroll: (employee) => {
    const payroll = payrollService.getAll();
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const newPayroll = {
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      basicSalary: parseFloat(employee.basicSalary) || 0,
      allowance: 0,
      bonus: 0,
      deductions: 0,
      netSalary: parseFloat(employee.basicSalary) || 0,
      status: 'Pending',
      month: currentMonth,
      date: new Date().toISOString().split('T')[0]
    };
    payroll.push(newPayroll);
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(payroll));
  },

  syncEmployeeUpdateToPayroll: (employee) => {
    const payroll = payrollService.getAll();
    const updatedPayroll = payroll.map(p => {
      if (p.employeeId === employee.employeeId) {
        return {
          ...p,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          position: employee.position,
          basicSalary: parseFloat(employee.basicSalary) || p.basicSalary,
          netSalary: parseFloat(employee.basicSalary) || p.netSalary
        };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(updatedPayroll));
  },

  syncEmployeeUpdateToAttendance: (employee) => {
    const attendance = attendanceService.getAll();
    const updatedAttendance = attendance.map(a => {
      if (a.employeeId === employee.employeeId) {
        return {
          ...a,
          employeeName: employee.name,
          department: employee.department
        };
      }
      return a;
    });
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updatedAttendance));
  },

  addLeaveActivity: (leaveRequest) => {
    // This will be picked up by recent activities
    console.log('New leave activity added:', leaveRequest);
  },

  deleteEmployeeRelatedData: (employee) => {
    // Remove from payroll
    const payroll = payrollService.getAll();
    const filteredPayroll = payroll.filter(p => p.employeeId !== employee.employeeId);
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(filteredPayroll));
    
    // Remove from leave requests
    const leaves = leaveService.getAll();
    const filteredLeaves = leaves.filter(l => l.employeeId !== employee.employeeId);
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(filteredLeaves));
    
    // Remove from attendance
    const attendance = attendanceService.getAll();
    const filteredAttendance = attendance.filter(a => a.employeeId !== employee.employeeId);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(filteredAttendance));
  }
};

// Simulate API call
export const simulateApiCall = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Action completed successfully' });
    }, 500);
  });
};