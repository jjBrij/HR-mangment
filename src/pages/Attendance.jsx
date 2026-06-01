// src/pages/Attendance.jsx - Fixed with proper keys
import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, 
  FiSearch, 
  FiDownload, 
  FiFilter,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPieChart,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiSave,
  FiX,
  FiEye,
  FiRefreshCw,
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAppContext } from '../context/AppContext';

const Attendance = () => {
  const { employees: globalEmployees, refreshData } = useAppContext();
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedRecordForDetails, setSelectedRecordForDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployeeForPresentDays, setSelectedEmployeeForPresentDays] = useState(null);
  const [showPresentDaysModal, setShowPresentDaysModal] = useState(false);
  
  // Filters
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Statistics
  const [statistics, setStatistics] = useState({
    presentDays: 0,
    absent: 0,
    leaves: 0,
    lateMarks: 0,
    totalDays: 0,
    attendancePercentage: 0
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Sync when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      loadData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [attendanceData, dateRange, selectedEmployee, selectedStatus, selectedDepartment, searchTerm]);

  const loadData = () => {
    // Load employees from global context or localStorage
    let employeeList = [];
    
    if (globalEmployees && globalEmployees.length > 0) {
      employeeList = globalEmployees;
    } else {
      const storedEmployees = localStorage.getItem('employees');
      if (storedEmployees && JSON.parse(storedEmployees).length > 0) {
        employeeList = JSON.parse(storedEmployees);
      }
    }
    setEmployees(employeeList);

    // Load attendance data
    const storedAttendance = localStorage.getItem('attendanceData');
    if (storedAttendance && JSON.parse(storedAttendance).length > 0) {
      const parsedData = JSON.parse(storedAttendance);
      setAttendanceData(parsedData);
      calculateStatistics(parsedData);
    } else if (employeeList.length > 0) {
      generateAttendanceData(employeeList);
    }
  };

  const generateAttendanceData = (employeeList) => {
    const data = [];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      employeeList.forEach(emp => {
        const randomStatus = Math.random();
        let status, checkIn, checkOut, totalHours;
        
        if (randomStatus < 0.7) {
          status = 'Present';
          const checkInHour = 9 + Math.floor(Math.random() * 2);
          const checkInMin = Math.floor(Math.random() * 60);
          const checkOutHour = 17 + Math.floor(Math.random() * 2);
          const checkOutMin = Math.floor(Math.random() * 60);
          checkIn = `${checkInHour.toString().padStart(2, '0')}:${checkInMin.toString().padStart(2, '0')}`;
          checkOut = `${checkOutHour.toString().padStart(2, '0')}:${checkOutMin.toString().padStart(2, '0')}`;
          const hours = (checkOutHour - checkInHour) + (checkOutMin - checkInMin) / 60;
          totalHours = hours.toFixed(1);
        } else if (randomStatus < 0.85) {
          status = 'Absent';
          checkIn = '-';
          checkOut = '-';
          totalHours = '0';
        } else if (randomStatus < 0.95) {
          status = 'Late';
          const checkInHour = 9 + Math.floor(Math.random() * 3) + 1;
          const checkInMin = Math.floor(Math.random() * 60);
          const checkOutHour = 17 + Math.floor(Math.random() * 2);
          const checkOutMin = Math.floor(Math.random() * 60);
          checkIn = `${checkInHour.toString().padStart(2, '0')}:${checkInMin.toString().padStart(2, '0')}`;
          checkOut = `${checkOutHour.toString().padStart(2, '0')}:${checkOutMin.toString().padStart(2, '0')}`;
          const hours = (checkOutHour - checkInHour) + (checkOutMin - checkInMin) / 60;
          totalHours = hours.toFixed(1);
        } else {
          status = 'Leave';
          checkIn = '-';
          checkOut = '-';
          totalHours = '0';
        }
        
        data.push({
          id: `${emp.id}_${d.toISOString().split('T')[0]}`,
          employeeId: emp.employeeId,
          employeeName: emp.name,
          department: emp.department,
          date: d.toISOString().split('T')[0],
          checkIn,
          checkOut,
          totalHours,
          status,
          overtime: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0
        });
      });
    }
    
    setAttendanceData(data);
    localStorage.setItem('attendanceData', JSON.stringify(data));
    calculateStatistics(data);
  };

  const calculateStatistics = (data) => {
    const present = data.filter(d => d.status === 'Present').length;
    const absent = data.filter(d => d.status === 'Absent').length;
    const leaves = data.filter(d => d.status === 'Leave').length;
    const late = data.filter(d => d.status === 'Late').length;
    const total = present + absent + leaves + late;
    const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    
    setStatistics({
      presentDays: present,
      absent: absent,
      leaves: leaves,
      lateMarks: late,
      totalDays: total,
      attendancePercentage: attendancePercentage
    });
  };

  const applyFilters = () => {
    let filtered = [...attendanceData];
    
    filtered = filtered.filter(record => 
      record.date >= dateRange.start && record.date <= dateRange.end
    );
    
    if (selectedEmployee !== 'all') {
      filtered = filtered.filter(record => record.employeeId === selectedEmployee);
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(record => record.department === selectedDepartment);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
    calculateStatistics(filtered);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    generateAttendanceData(employees);
    alert('Attendance data refreshed!');
  };

  const startEditing = (record) => {
    setEditingRow(record.id);
    setEditFormData({
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedAttendance = attendanceData.map(record => {
      if (record.id === id) {
        let totalHours = '0';
        if (editFormData.checkIn !== '-' && editFormData.checkOut !== '-') {
          const [inHour, inMin] = editFormData.checkIn.split(':');
          const [outHour, outMin] = editFormData.checkOut.split(':');
          const hours = (parseInt(outHour) - parseInt(inHour)) + (parseInt(outMin) - parseInt(inMin)) / 60;
          totalHours = hours.toFixed(1);
        }
        
        return {
          ...record,
          checkIn: editFormData.checkIn,
          checkOut: editFormData.checkOut,
          status: editFormData.status,
          totalHours
        };
      }
      return record;
    });
    
    setAttendanceData(updatedAttendance);
    localStorage.setItem('attendanceData', JSON.stringify(updatedAttendance));
    setEditingRow(null);
    setLoading(false);
    alert('Attendance record updated successfully!');
  };

  const cancelEditing = () => {
    setEditingRow(null);
    setEditFormData({});
  };

  const viewDetails = (record) => {
    setSelectedRecordForDetails(record);
    setShowDetailsModal(true);
  };

  const viewPresentDays = (employeeName, employeeId) => {
    const employeeRecords = filteredData.filter(record => 
      record.employeeName === employeeName && record.employeeId === employeeId
    );
    
    const presentRecords = employeeRecords.filter(record => record.status === 'Present');
    const absentRecords = employeeRecords.filter(record => record.status === 'Absent');
    const leaveRecords = employeeRecords.filter(record => record.status === 'Leave');
    const lateRecords = employeeRecords.filter(record => record.status === 'Late');
    
    const last10Days = [...employeeRecords].reverse().slice(0, 10).reverse();
    
    setSelectedEmployeeForPresentDays({
      name: employeeName,
      id: employeeId,
      present: presentRecords.length,
      absent: absentRecords.length,
      leave: leaveRecords.length,
      late: lateRecords.length,
      total: employeeRecords.length,
      attendancePercentage: employeeRecords.length > 0 ? ((presentRecords.length / employeeRecords.length) * 100).toFixed(1) : 0,
      recentDays: last10Days
    });
    setShowPresentDaysModal(true);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Employee ID', 'Employee Name', 'Department', 'Check In', 'Check Out', 'Total Hours', 'Status', 'Overtime'];
    const csvData = filteredData.map(record => [
      record.date,
      record.employeeId,
      record.employeeName,
      record.department,
      record.checkIn,
      record.checkOut,
      record.totalHours,
      record.status,
      record.overtime
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${dateRange.start}_to_${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert('Attendance data exported successfully!');
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Pie chart data with minimum value handling
  const pieChartData = [
    { name: 'Present', value: statistics.presentDays || 0.1, color: '#10B981', displayValue: statistics.presentDays },
    { name: 'Absent', value: statistics.absent || 0.1, color: '#EF4444', displayValue: statistics.absent },
    { name: 'Leave', value: statistics.leaves || 0.1, color: '#F59E0B', displayValue: statistics.leaves },
    { name: 'Late', value: statistics.lateMarks || 0.1, color: '#8B5CF6', displayValue: statistics.lateMarks }
  ].filter(item => item.displayValue > 0 || true);

  // Get unique departments for filter - FIXED: Added proper keys
  const departments = [...new Set(employees.map(emp => emp.department))];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Present':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700"><FiCheckCircle className="mr-1" size={12} />Present</span>;
      case 'Absent':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700"><FiXCircle className="mr-1" size={12} />Absent</span>;
      case 'Leave':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700"><FiCalendar className="mr-1" size={12} />Leave</span>;
      case 'Late':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700"><FiAlertCircle className="mr-1" size={12} />Late</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Attendance Management</h1>
        <p className="text-gray-500 mt-1">Track and manage employee attendance</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
        <div className="stat-card cursor-pointer hover:shadow-md transition" onClick={() => setSelectedStatus('Present')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Present Days</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{statistics.presentDays}</p>
              <p className="text-xs text-green-600 mt-2">{statistics.attendancePercentage}% of total</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="stat-card cursor-pointer hover:shadow-md transition" onClick={() => setSelectedStatus('Absent')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Absent</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{statistics.absent}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <FiXCircle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="stat-card cursor-pointer hover:shadow-md transition" onClick={() => setSelectedStatus('Leave')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Leaves</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{statistics.leaves}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <FiCalendar className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="stat-card cursor-pointer hover:shadow-md transition" onClick={() => setSelectedStatus('Late')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Late Marks</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{statistics.lateMarks}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FiAlertCircle className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Days</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{statistics.totalDays}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FiBarChart2 className="text-indigo-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Pie Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiPieChart className="text-indigo-600 text-xl" />
            <h3 className="text-lg font-semibold text-gray-800">Attendance Summary</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => {
                    const dataItem = pieChartData.find(d => d.name === name);
                    if (dataItem && dataItem.displayValue > 0) {
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }
                    return '';
                  }}
                  labelLine={false}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => {
                  const dataItem = pieChartData.find(d => d.name === name);
                  return [`${dataItem?.displayValue || 0} days`, name];
                }} />
                <Legend 
                  formatter={(value) => {
                    const dataItem = pieChartData.find(d => d.name === value);
                    return `${value} (${dataItem?.displayValue || 0} days)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-white"
              >
                <option key="all-employees" value="all">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.employeeId}>{emp.name} ({emp.employeeId})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-white"
              >
                <option key="all-status" value="all">All Status</option>
                <option key="status-present" value="Present">Present</option>
                <option key="status-absent" value="Absent">Absent</option>
                <option key="status-leave" value="Leave">Leave</option>
                <option key="status-late" value="Late">Late</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-white"
              >
                <option key="all-departments" value="all">All Departments</option>
                {departments.map((dept, index) => (
                  <option key={`dept-${dept}-${index}`} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm flex items-center gap-2"
            >
              <FiRefreshCw size={14} />
              Apply Filters
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm flex items-center gap-2"
            >
              <FiDownload size={14} />
              Export to Excel
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Attendance Table - Same as before */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check In</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check Out</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total Hours</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((record, index) => (
                <tr key={`attendance-${record.id}-${index}`} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{record.date}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 p-1 rounded-lg transition"
                      onClick={() => viewPresentDays(record.employeeName, record.employeeId)}
                    >
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FiUser className="text-indigo-600 text-sm" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 hover:text-indigo-600">{record.employeeName}</p>
                        <p className="text-xs text-gray-500">{record.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{record.department}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingRow === record.id ? (
                      <input
                        type="time"
                        name="checkIn"
                        value={editFormData.checkIn}
                        onChange={handleEditChange}
                        className="w-24 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">{record.checkIn}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingRow === record.id ? (
                      <input
                        type="time"
                        name="checkOut"
                        value={editFormData.checkOut}
                        onChange={handleEditChange}
                        className="w-24 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">{record.checkOut}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-gray-800">{record.totalHours}h</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingRow === record.id ? (
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditChange}
                        className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                      >
                        <option key="status-present-edit" value="Present">Present</option>
                        <option key="status-absent-edit" value="Absent">Absent</option>
                        <option key="status-leave-edit" value="Leave">Leave</option>
                        <option key="status-late-edit" value="Late">Late</option>
                      </select>
                    ) : (
                      getStatusBadge(record.status)
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {editingRow === record.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(record.id)}
                            disabled={loading}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Save"
                            key={`save-${record.id}`}
                          >
                            <FiSave size={16} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Cancel"
                            key={`cancel-${record.id}`}
                          >
                            <FiX size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(record)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit"
                            key={`edit-${record.id}`}
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => viewDetails(record)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                            key={`view-${record.id}`}
                          >
                            <FiEye size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                key="prev-page"
              >
                <FiChevronLeft size={16} />
              </button>
              {[...Array(Math.min(totalPages, 7))].map((_, index) => {
                let pageNumber;
                if (totalPages <= 7) {
                  pageNumber = index + 1;
                } else if (currentPage <= 4) {
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNumber = totalPages - 6 + index;
                } else {
                  pageNumber = currentPage - 3 + index;
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
                key="next-page"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No attendance records found</p>
            <button
              onClick={handleRefresh}
              className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Generate Attendance Data →
            </button>
          </div>
        )}
      </div>

      {/* View Details Modal - Keep same structure */}
      {showDetailsModal && selectedRecordForDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto" key="details-modal">
          {/* Modal content - same as before */}  
        </div>
      )}

      {/* Present Days Modal - Keep same structure */}
      {showPresentDaysModal && selectedEmployeeForPresentDays && (
        <div className="fixed inset-0 z-50 overflow-y-auto" key="present-days-modal">
          {/* Modal content - same as before */}
        </div>
      )}
    </div>
  );
};

export default Attendance;