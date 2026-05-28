// src/data/dummyData.js
// Dummy data for HRMS Dashboard - Easily replaceable with API calls

export const dashboardStats = {
  totalEmployees: 245,
  onLeave: 19,
  payroll: 17,
  attendance: 81,
  monthlyGrowth: 12,
};

export const employeeOverview = {
  newHires: 14,
  departures: 3,
  transfers: 2,
  promotions: 5,
  percentages: {
    newHires: '+27%',
    departures: '-25%',
    transfers: '+100%',
    promotions: '+67%',
  },
  chartData: [300, 200, 100, 0, 14, 3, 2, 5],
};

export const upcomingBirthdays = [
  { id: 1, name: 'BRIJMOHAN PRASAD', department: 'Marketing', date: 'May 20' },
  { id: 2, name: 'SURAJ KUMAR', department: 'Development', date: 'May 22' },
  { id: 3, name: 'SUGANDH ', department: 'Human Resources', date: 'May 25' },
];

export const recentActivities = [
  { id: 1, title: 'Sophia Williams has applied for leave', date: 'May 18, 2025', description: 'Annual Leave', type: 'leave' },
  { id: 2, title: 'Michael Brown has clocked in', date: 'May 18, 2025', description: '09:01 AM', type: 'attendance' },
  { id: 3, title: "Emma Johnson's payroll is processed", date: 'May 18, 2025', description: '$4,850', type: 'payroll' },
  { id: 4, title: 'Daniel Martinez has joined the company', date: 'May 17, 2025', description: 'UX Designer', type: 'hire' },
];

export const leaveSummary = {
  annual: 17,
  sick: 4,
  personal: 2,
  other: 2,
};

export const employeesList = [
  { id: 1, name: 'John Doe', email: 'john.doe@company.com', department: 'Engineering', position: 'Senior Developer', joinDate: '2022-01-15', status: 'Active', avatar: 'JD' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah.j@company.com', department: 'Marketing', position: 'Marketing Manager', joinDate: '2021-08-20', status: 'Active', avatar: 'SJ' },
  { id: 3, name: 'Michael Chen', email: 'michael.chen@company.com', department: 'Sales', position: 'Sales Representative', joinDate: '2023-02-10', status: 'Active', avatar: 'MC' },
  { id: 4, name: 'Emily Rodriguez', email: 'emily.r@company.com', department: 'HR', position: 'HR Specialist', joinDate: '2020-11-05', status: 'On Leave', avatar: 'ER' },
  { id: 5, name: 'David Kim', email: 'david.kim@company.com', department: 'Engineering', position: 'Frontend Developer', joinDate: '2023-01-20', status: 'Active', avatar: 'DK' },
];

export const payrollData = [
  { id: 1, employee: 'BRIJMOHAN', amount: 5850, month: 'May 2025', status: 'Processed', date: '2025-05-15' },
  { id: 2, employee: 'SURAJ', amount: 6200, month: 'May 2025', status: 'Processed', date: '2025-05-15' },
  { id: 3, employee: 'SUGANDH', amount: 4500, month: 'May 2025', status: 'Pending', date: '2025-05-18' },
  { id: 4, employee: 'Emily Rodriguez', amount: 5100, month: 'May 2025', status: 'Processed', date: '2025-05-14' },
  { id: 5, employee: 'David Kim', amount: 4750, month: 'May 2025', status: 'Pending', date: '2025-05-18' },
];

export const leaveRequests = [
  { id: 1, employee: 'Sophia Williams', type: 'Annual Leave', startDate: '2025-05-20', endDate: '2025-05-25', status: 'Pending', days: 5 },
  { id: 2, employee: 'James Brown', type: 'Sick Leave', startDate: '2025-05-19', endDate: '2025-05-21', status: 'Approved', days: 3 },
  { id: 3, employee: 'Emma Wilson', type: 'Personal Leave', startDate: '2025-05-22', endDate: '2025-05-23', status: 'Pending', days: 2 },
];

// Helper function to simulate API delay (for testing button actions)
export const simulateApiCall = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Action completed successfully' });
    }, 500);
  });
};