// src/pages/Leave.jsx - Fixed with automatic cleanup on employee deletion
import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, 
  FiUser, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiDownload,
  FiPlus,
  FiEye,
  FiFileText,
  FiSend,
  FiRefreshCw,
  FiX
} from 'react-icons/fi';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, differenceInDays, isValid, isBefore, isAfter, startOfToday } from 'date-fns';
import { useAppContext } from '../context/AppContext';

const Leave = () => {
  const { employees: globalEmployees, refreshData } = useAppContext();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Filters
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Leave Application Form
  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    fromDate: '',
    toDate: '',
    reason: '',
    type: 'Casual Leave'
  });
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [dateErrors, setDateErrors] = useState({
    fromDate: '',
    toDate: ''
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  // Clean up orphaned leave requests (employees that no longer exist)
  const cleanupOrphanedLeaves = (leaveList, employeeList) => {
    if (!leaveList.length || !employeeList.length) {
      // If no employees exist, clear all leave requests
      if (employeeList.length === 0 && leaveList.length > 0) {
        localStorage.setItem('leaveRequests', JSON.stringify([]));
        return [];
      }
      return leaveList;
    }
    
    const validEmployeeIds = employeeList.map(emp => emp.employeeId || emp.id);
    const cleanedLeaves = leaveList.filter(leave => {
      // Check if the leave has a valid employee ID and it exists in current employees
      return leave.employeeId && validEmployeeIds.includes(leave.employeeId);
    });
    
    // Also update employee names to match current data
    const updatedLeaves = cleanedLeaves.map(leave => {
      const matchingEmployee = employeeList.find(emp => (emp.employeeId || emp.id) === leave.employeeId);
      if (matchingEmployee) {
        return {
          ...leave,
          employeeName: matchingEmployee.name,
          department: matchingEmployee.department
        };
      }
      return leave;
    });
    
    if (updatedLeaves.length !== leaveList.length) {
      localStorage.setItem('leaveRequests', JSON.stringify(updatedLeaves));

    }
    
    return updatedLeaves;
  };

  // Load data on mount and when forceRefresh changes
  useEffect(() => {
    loadData();
  }, [forceRefresh, globalEmployees]);

  useEffect(() => {
    applyFilters();
  }, [leaveRequests, dateRange, selectedEmployee, selectedStatus, selectedDepartment, searchTerm]);

  // Listen for storage changes (when employees are deleted from another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'employees' || e.key === 'leaveRequests') {
        loadData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadData = () => {
    
    // Load employees
    let employeeList = [];
    if (globalEmployees && globalEmployees.length > 0) {
      employeeList = globalEmployees;
    } else {
      const storedEmployees = localStorage.getItem('employees');
      if (storedEmployees && JSON.parse(storedEmployees).length > 0) {
        employeeList = JSON.parse(storedEmployees);
      }
    }
    
    // Filter out any invalid employees (with empty names)
    employeeList = employeeList.filter(emp => emp.name && emp.name.trim() !== '' && emp.name !== 'Unknown');
    setEmployees(employeeList);

    // Load leave requests
    let storedLeaves = localStorage.getItem('leaveRequests');
    let parsedLeaves = [];
    
    if (storedLeaves) {
      parsedLeaves = JSON.parse(storedLeaves);
      
      // Clean up orphaned leave requests (remove leaves for deleted employees)
      const cleanedLeaves = cleanupOrphanedLeaves(parsedLeaves, employeeList);
      
      setLeaveRequests(cleanedLeaves);
    } else {
      setLeaveRequests([]);
      localStorage.setItem('leaveRequests', JSON.stringify([]));
    }
  };

  const calculateStatistics = (data) => {
    const total = data.length;
    const approved = data.filter(l => l.status === 'Approved').length;
    const pending = data.filter(l => l.status === 'Pending').length;
    const rejected = data.filter(l => l.status === 'Rejected').length;
    
    setStatistics({ total, approved, pending, rejected });
  };

  const applyFilters = () => {
    let filtered = [...leaveRequests];
    
    // Date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      
      filtered = filtered.filter(record => {
        if (!record.fromDate || !record.toDate) return false;
        const fromDate = new Date(record.fromDate);
        const toDate = new Date(record.toDate);
        return fromDate <= endDate && toDate >= startDate;
      });
    }
    
    // Employee filter
    if (selectedEmployee !== 'all') {
      filtered = filtered.filter(record => record.employeeId === selectedEmployee);
    }
    
    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }
    
    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(record => record.department === selectedDepartment);
    }
    
    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(record => 
        (record.employeeName && record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.employeeId && record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.reason && record.reason.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredRequests(filtered);
    calculateStatistics(filtered);
    setCurrentPage(1);
  };

  // Safe date formatter function
  const safeFormatDate = (dateString, dateFormat = 'dd MMM yyyy') => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (!isValid(date)) return 'Invalid Date';
    return format(date, dateFormat);
  };

  // Validate dates (prevent past dates)
  const validateDates = (fromDate, toDate) => {
    const errors = { fromDate: '', toDate: '' };
    const today = startOfToday();
    
    if (fromDate) {
      const from = new Date(fromDate);
      if (isBefore(from, today)) {
        errors.fromDate = 'From date cannot be in the past';
      }
    }
    
    if (toDate) {
      const to = new Date(toDate);
      if (isBefore(to, today)) {
        errors.toDate = 'To date cannot be in the past';
      }
    }
    
    if (fromDate && toDate && !errors.fromDate && !errors.toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (isBefore(to, from)) {
        errors.toDate = 'To date must be after from date';
      }
    }
    
    setDateErrors(errors);
    return errors.fromDate === '' && errors.toDate === '';
  };

  const handleLeaveFormChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'fromDate' || name === 'toDate') {
      const newFromDate = name === 'fromDate' ? value : leaveForm.fromDate;
      const newToDate = name === 'toDate' ? value : leaveForm.toDate;
      
      if (newFromDate && newToDate) {
        validateDates(newFromDate, newToDate);
        calculateLeaveDays(newFromDate, newToDate);
      } else if (newFromDate) {
        validateDates(newFromDate, '');
        calculateLeaveDays(newFromDate, '');
      } else if (newToDate) {
        validateDates('', newToDate);
        calculateLeaveDays('', newToDate);
      }
    }
  };

  const calculateLeaveDays = (fromDateParam, toDateParam) => {
    const from = fromDateParam || leaveForm.fromDate;
    const to = toDateParam || leaveForm.toDate;
    
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      if (isValid(fromDate) && isValid(toDate) && toDate >= fromDate) {
        const days = differenceInDays(toDate, fromDate) + 1;
        setCalculatedDays(days > 0 ? days : 0);
      } else {
        setCalculatedDays(0);
      }
    } else {
      setCalculatedDays(0);
    }
  };

  const submitLeaveApplication = async () => {
    // Validation
    if (!leaveForm.employeeId) {
      alert('Please select an employee');
      return;
    }
    if (!leaveForm.fromDate) {
      alert('Please select from date');
      return;
    }
    if (!leaveForm.toDate) {
      alert('Please select to date');
      return;
    }
    if (!leaveForm.reason) {
      alert('Please provide a reason');
      return;
    }
    
    // Validate dates are not in past
    const isValidDates = validateDates(leaveForm.fromDate, leaveForm.toDate);
    if (!isValidDates) {
      alert('Please fix date errors before submitting');
      return;
    }
    
    if (calculatedDays <= 0) {
      alert('Invalid date range. Please check your dates.');
      return;
    }
    
    setLoading(true);
    
    const employee = employees.find(emp => emp.employeeId === leaveForm.employeeId);
    
    const newLeave = {
      id: Date.now(),
      employeeId: leaveForm.employeeId,
      employeeName: employee?.name || 'Unknown',
      department: employee?.department || 'Unknown',
      fromDate: leaveForm.fromDate,
      toDate: leaveForm.toDate,
      days: calculatedDays,
      reason: leaveForm.reason,
      type: leaveForm.type,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
      reviewedBy: null,
      reviewedOn: null,
      remarks: null
    };
    
    
    // Get existing leave requests
    const existingLeaves = localStorage.getItem('leaveRequests');
    let updatedLeaves = [];
    
    if (existingLeaves) {
      const parsedLeaves = JSON.parse(existingLeaves);
      updatedLeaves = [...parsedLeaves, newLeave];
    } else {
      updatedLeaves = [newLeave];
    }
    
    
    // Save to localStorage
    localStorage.setItem('leaveRequests', JSON.stringify(updatedLeaves));
    
    // Update state immediately
    setLeaveRequests(updatedLeaves);
    
    // Force a re-render of filtered data
    setForceRefresh(prev => prev + 1);
    
    // Refresh data in context if available
    if (refreshData) {
      refreshData();
    }
    
    // Reset form
    setShowApplyModal(false);
    setLeaveForm({
      employeeId: '',
      fromDate: '',
      toDate: '',
      reason: '',
      type: 'Casual Leave'
    });
    setCalculatedDays(0);
    setDateErrors({ fromDate: '', toDate: '' });
    setLoading(false);
    
    alert('Leave application submitted successfully!');
    
    // Force another refresh to ensure UI updates
    setTimeout(() => {
      loadData();
    }, 100);
  };

  const handleApprove = async (id) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedLeaves = leaveRequests.map(leave =>
      leave.id === id 
        ? { 
            ...leave, 
            status: 'Approved', 
            reviewedBy: 'HR Manager',
            reviewedOn: new Date().toISOString().split('T')[0],
            remarks: 'Approved'
          }
        : leave
    );
    
    setLeaveRequests(updatedLeaves);
    localStorage.setItem('leaveRequests', JSON.stringify(updatedLeaves));
    if (refreshData) refreshData();
    setForceRefresh(prev => prev + 1);
    setLoading(false);
    alert('Leave request approved successfully!');
  };

  const handleReject = async (id) => {
    const remarks = prompt('Please provide reason for rejection:');
    if (!remarks) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedLeaves = leaveRequests.map(leave =>
      leave.id === id 
        ? { 
            ...leave, 
            status: 'Rejected', 
            reviewedBy: 'HR Manager',
            reviewedOn: new Date().toISOString().split('T')[0],
            remarks: remarks
          }
        : leave
    );
    
    setLeaveRequests(updatedLeaves);
    localStorage.setItem('leaveRequests', JSON.stringify(updatedLeaves));
    if (refreshData) refreshData();
    setForceRefresh(prev => prev + 1);
    setLoading(false);
    alert('Leave request rejected!');
  };

  const viewLeaveDetails = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const exportToCSV = () => {
    const headers = ['Employee ID', 'Employee Name', 'Department', 'From Date', 'To Date', 'Days', 'Leave Type', 'Reason', 'Status', 'Applied On'];
    const csvData = filteredRequests.map(record => [
      record.employeeId || '',
      record.employeeName || '',
      record.department || '',
      record.fromDate || '',
      record.toDate || '',
      record.days || 0,
      record.type || '',
      `"${record.reason || ''}"`,
      record.status || '',
      record.appliedOn || ''
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave_requests_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert('Leave data exported successfully!');
  };

  const resetFilters = () => {
    setDateRange({
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
    setSelectedEmployee('all');
    setSelectedStatus('all');
    setSelectedDepartment('all');
    setSearchTerm('');
    setTimeout(() => applyFilters(), 0);
  };

  // Calendar generation with safe date handling
  const getCalendarDays = () => {
    if (!isValid(currentMonth)) {
      setCurrentMonth(new Date());
      return [];
    }
    
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const startDayOfWeek = start.getDay();
    const prevMonthDays = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(start);
      prevDate.setDate(start.getDate() - (i + 1));
      prevMonthDays.push(prevDate);
    }
    
    const endDayOfWeek = end.getDay();
    const nextMonthDays = [];
    for (let i = 1; i <= 6 - endDayOfWeek; i++) {
      const nextDate = new Date(end);
      nextDate.setDate(end.getDate() + i);
      nextMonthDays.push(nextDate);
    }
    
    return [...prevMonthDays, ...days, ...nextMonthDays];
  };

  const getLeaveColor = (date) => {
    if (!isValid(date)) return '';
    const dateStr = format(date, 'yyyy-MM-dd');
    const leave = leaveRequests.find(l => l.fromDate <= dateStr && l.toDate >= dateStr);
    if (!leave) return '';
    switch(leave.status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return '';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700"><FiCheckCircle className="mr-1" size={12} />Approved</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700"><FiClock className="mr-1" size={12} />Pending</span>;
      case 'Rejected':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700"><FiXCircle className="mr-1" size={12} />Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{status || 'Unknown'}</span>;
    }
  };

  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

  return (
    <div className="animate-fade-in pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-gray-500 mt-1">Manage employee leave requests and approvals</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md"
        >
          <FiPlus size={18} />
          Apply Leave
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Leaves</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{statistics.total}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FiFileText className="text-indigo-600 text-lg" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{statistics.approved}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="text-green-600 text-lg" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{statistics.pending}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <FiClock className="text-yellow-600 text-lg" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{statistics.rejected}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <FiXCircle className="text-red-600 text-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <FiFilter className="text-indigo-600" />
            <span className="font-medium text-gray-700">Filters</span>
            {(selectedEmployee !== 'all' || selectedStatus !== 'all' || selectedDepartment !== 'all' || searchTerm) && (
              <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-600 rounded-full">Active</span>
            )}
          </div>
          <FiChevronRight className={`transform transition-transform ${isFilterOpen ? 'rotate-90' : ''}`} />
        </button>
        
        {isFilterOpen && (
          <div className="p-4 border-t border-gray-100">
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">Date Range</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">From Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">To Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white"
                >
                  <option key="all-employees" value="all">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.employeeId}>{emp.name} ({emp.employeeId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white"
                >
                  <option key="all-status" value="all">All Status</option>
                  <option key="status-approved" value="Approved">Approved</option>
                  <option key="status-pending" value="Pending">Pending</option>
                  <option key="status-rejected" value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white"
                >
                  <option key="all-departments" value="all">All Departments</option>
                  {departments.map((dept, idx) => (
                    <option key={`dept-${dept}-${idx}`} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Search</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search by name or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Reset Filters
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Calendar and Leave Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Calendar Section */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{safeFormatDate(currentMonth, 'MMMM yyyy')}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {getCalendarDays().map((date, idx) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const leaveColor = getLeaveColor(date);
              const isToday = isSameDay(date, new Date());
              
              return (
                <div
                  key={`calendar-day-${idx}`}
                  className={`text-center py-2 text-sm rounded-lg transition ${
                    isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                  } ${leaveColor} ${
                    isToday ? 'ring-2 ring-indigo-500 font-bold' : ''
                  } hover:bg-gray-100 cursor-pointer`}
                >
                  {isValid(date) ? format(date, 'd') : '?'}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span className="text-gray-600">Approved</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-100 rounded"></div>
              <span className="text-gray-600">Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 rounded"></div>
              <span className="text-gray-600">Rejected</span>
            </div>
          </div>
        </div>

        {/* Leave Summary Cards */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-full">
            <h3 className="font-semibold text-gray-800 mb-4">Leave Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-indigo-50 rounded-xl">
                <p className="text-2xl font-bold text-indigo-600">{statistics.total}</p>
                <p className="text-xs text-gray-600">Total Leaves</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{statistics.approved}</p>
                <p className="text-xs text-gray-600">Approved</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-xl">
                <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <p className="text-2xl font-bold text-red-600">{statistics.rejected}</p>
                <p className="text-xs text-gray-600">Rejected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-semibold text-gray-800">
            Leave Requests 
            <span className="ml-2 text-sm font-normal text-gray-500">({filteredRequests.length} entries)</span>
          </h3>
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2"
          >
            <FiDownload size={14} />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">From</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">To</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Days</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reason</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length > 0 ? (
                currentItems.map((request, index) => (
                  <tr key={`leave-${request.id}-${index}`} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FiUser className="text-indigo-600 text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{request.employeeName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{request.employeeId || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{request.department || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{safeFormatDate(request.fromDate)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{safeFormatDate(request.toDate)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-gray-800">{request.days || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700 max-w-xs truncate">{request.reason || 'No reason provided'}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => viewLeaveDetails(request)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                        {request.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={loading}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Approve"
                            >
                              <FiCheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              disabled={loading}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Reject"
                            >
                              <FiXCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <div className="text-center">
                      <FiCalendar className="mx-auto text-gray-400 text-5xl mb-3" />
                      <p className="text-gray-500">No leave requests found</p>
                      <p className="text-sm text-gray-400 mt-1">Click "Apply Leave" to create a new request</p>
                      <button
                        onClick={() => setShowApplyModal(true)}
                        className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Apply for Leave →
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRequests.length)} of {filteredRequests.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiChevronLeft size={16} />
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }
                
                if (pageNumber >= 1 && pageNumber <= totalPages) {
                  return (
                    <button
                      key={`page-${pageNumber}`}
                      onClick={() => paginate(pageNumber)}
                      className={`px-3 py-1 rounded-lg transition ${
                        currentPage === pageNumber
                          ? 'bg-indigo-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowApplyModal(false)}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Apply Leave</h2>
                  <p className="text-sm text-gray-500 mt-1">Fill the details below to apply for leave</p>
                </div>
                <button onClick={() => setShowApplyModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
                  <select
                    name="employeeId"
                    value={leaveForm.employeeId}
                    onChange={handleLeaveFormChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.employeeId}>{emp.name} ({emp.employeeId}) - {emp.department}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date *</label>
                    <input
                      type="date"
                      name="fromDate"
                      value={leaveForm.fromDate}
                      onChange={handleLeaveFormChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border ${dateErrors.fromDate ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-indigo-400`}
                    />
                    {dateErrors.fromDate && <p className="mt-1 text-xs text-red-500">{dateErrors.fromDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date *</label>
                    <input
                      type="date"
                      name="toDate"
                      value={leaveForm.toDate}
                      onChange={handleLeaveFormChange}
                      min={leaveForm.fromDate || new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border ${dateErrors.toDate ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-indigo-400`}
                    />
                    {dateErrors.toDate && <p className="mt-1 text-xs text-red-500">{dateErrors.toDate}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Days (Auto Calculated)</label>
                  <input
                    type="text"
                    value={`${calculatedDays} Day${calculatedDays !== 1 ? 's' : ''}`}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                  <select
                    name="type"
                    value={leaveForm.type}
                    onChange={handleLeaveFormChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                  >
                    <option>Casual Leave</option>
                    <option>Sick Leave</option>
                    <option>Annual Leave</option>
                    <option>Business Leave</option>
                    <option>Unpaid Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                  <textarea
                    name="reason"
                    rows="3"
                    value={leaveForm.reason}
                    onChange={handleLeaveFormChange}
                    placeholder="Please provide reason for leave..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 resize-none"
                  ></textarea>
                </div>
              </div>
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitLeaveApplication}
                  disabled={loading || !leaveForm.employeeId || !leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason || calculatedDays <= 0 || dateErrors.fromDate || dateErrors.toDate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FiSend size={16} />
                  {loading ? 'Submitting...' : 'Submit Leave'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Leave Details Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowViewModal(false)}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full animate-fade-in">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Leave Request Details</h2>
                  <p className="text-sm text-gray-500">ID: {selectedRequest.id}</p>
                </div>
                <button onClick={() => setShowViewModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Employee Name</p>
                    <p className="font-semibold text-gray-800">{selectedRequest.employeeName || 'Unknown'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Employee ID</p>
                    <p className="font-semibold text-gray-800">{selectedRequest.employeeId || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-semibold text-gray-800">{selectedRequest.department || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Leave Type</p>
                    <p className="font-semibold text-gray-800">{selectedRequest.type || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">From Date</p>
                    <p className="font-semibold text-gray-800">{safeFormatDate(selectedRequest.fromDate)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">To Date</p>
                    <p className="font-semibold text-gray-800">{safeFormatDate(selectedRequest.toDate)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Days</p>
                    <p className="font-semibold text-gray-800">{selectedRequest.days || 0} Days</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Status</p>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Reason</p>
                  <p className="text-gray-800 mt-1">{selectedRequest.reason || 'No reason provided'}</p>
                </div>
                {selectedRequest.remarks && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Remarks</p>
                    <p className="text-gray-800 mt-1">{selectedRequest.remarks}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Applied On</p>
                    <p className="font-semibold text-gray-800">{safeFormatDate(selectedRequest.appliedOn)}</p>
                  </div>
                  {selectedRequest.reviewedOn && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Reviewed On</p>
                      <p className="font-semibold text-gray-800">{safeFormatDate(selectedRequest.reviewedOn)}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
                >
                  Close
                </button>
                {selectedRequest.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedRequest.id);
                        setShowViewModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <FiCheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedRequest.id);
                        setShowViewModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center gap-2"
                    >
                      <FiXCircle size={16} />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;