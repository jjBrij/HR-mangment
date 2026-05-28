// src/pages/Performance.jsx (Fully Updated with Integration)
import React, { useState, useEffect } from 'react';
import { 
  
  FiAward, 
  FiStar, 
  FiTrendingUp, 
  FiTrendingDown,
  FiUsers,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiCalendar,
  FiEdit2,
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiUser,
  FiBriefcase,
  FiDownload,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw
} from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Performance = () => {
  const [employees, setEmployees] = useState([]);
  const [targets, setTargets] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingRow, setEditingRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTarget, setNewTarget] = useState({
    employeeId: '',
    month: new Date().toISOString().slice(0, 7),
    projectCompletion: 0,
    taskEfficiency: 0,
    targetAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedMonthForChart, setSelectedMonthForChart] = useState('all');

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalEmployees: 0,
    averagePerformance: 0,
    highestAttendance: 0,
    targetCompletion: 0
  });

  // Top employees
  const [topEmployees, setTopEmployees] = useState([]);

  // Performance chart data
  const [performanceChartData, setPerformanceChartData] = useState([]);

  // Available months for filter
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
    calculatePerformanceMetrics();
    calculateTopEmployees();
    generateChartData();
  }, [employees, targets, attendanceData, searchTerm, selectedMonth, selectedMonthForChart]);

  // Sync when localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'employees' || e.key === 'attendanceData' || e.key === 'performanceTargets') {
        loadData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadData = () => {
    // Load employees from localStorage
    const storedEmployees = localStorage.getItem('employees');
    let employeeList = [];
    
    if (storedEmployees && JSON.parse(storedEmployees).length > 0) {
      employeeList = JSON.parse(storedEmployees);
    } else {
      employeeList = [
        { id: 1, employeeId: 'EMP001', name: 'Raj Sharma', department: 'Sales', email: 'raj@demo.com', joinDate: '2022-01-15', status: 'Active' },
        { id: 2, employeeId: 'EMP002', name: 'Aman Gupta', department: 'HR', email: 'aman@demo.com', joinDate: '2021-08-20', status: 'Active' },
        { id: 3, employeeId: 'EMP003', name: 'Neha Singh', department: 'Marketing', email: 'neha@demo.com', joinDate: '2023-02-10', status: 'Active' },
        { id: 4, employeeId: 'EMP004', name: 'Priya Patel', department: 'Engineering', email: 'priya@demo.com', joinDate: '2020-11-05', status: 'Active' },
        { id: 5, employeeId: 'EMP005', name: 'Vikram Mehta', department: 'Sales', email: 'vikram@demo.com', joinDate: '2023-01-20', status: 'Active' },
        { id: 6, employeeId: 'EMP006', name: 'Anjali Nair', department: 'Finance', email: 'anjali@demo.com', joinDate: '2022-06-10', status: 'Active' },
        { id: 7, employeeId: 'EMP007', name: 'Rahul Verma', department: 'Operations', email: 'rahul@demo.com', joinDate: '2021-12-01', status: 'Active' },
        { id: 8, employeeId: 'EMP008', name: 'Kavita Joshi', department: 'Marketing', email: 'kavita@demo.com', joinDate: '2023-03-15', status: 'Active' },
        { id: 9, employeeId: 'EMP009', name: 'Suresh Reddy', department: 'Engineering', email: 'suresh@demo.com', joinDate: '2022-09-10', status: 'Active' },
        { id: 10, employeeId: 'EMP010', name: 'Deepika Singh', department: 'Sales', email: 'deepika@demo.com', joinDate: '2022-11-20', status: 'Active' }
      ];
      localStorage.setItem('employees', JSON.stringify(employeeList));
    }
    setEmployees(employeeList);

    // Load attendance data
    const storedAttendance = localStorage.getItem('attendanceData');
    if (storedAttendance && JSON.parse(storedAttendance).length > 0) {
      setAttendanceData(JSON.parse(storedAttendance));
    }

    // Load targets and clean up orphaned records
    const storedTargets = localStorage.getItem('performanceTargets');
    let targetList = [];
    
    if (storedTargets && JSON.parse(storedTargets).length > 0) {
      targetList = JSON.parse(storedTargets);
      // Clean up targets for deleted employees
      const validEmployeeIds = employeeList.map(emp => emp.employeeId);
      const cleanedTargets = targetList.filter(target => validEmployeeIds.includes(target.employeeId));
      
      if (cleanedTargets.length !== targetList.length) {
        localStorage.setItem('performanceTargets', JSON.stringify(cleanedTargets));
        targetList = cleanedTargets;
      }
      setTargets(targetList);
    } else {
      generateDefaultTargets(employeeList);
    }
  };

  // Calculate attendance percentage from attendance table for a specific employee and month
  const calculateAttendancePercentage = (employeeId, month) => {
    const [year, monthNum] = month.split('-');
    
    const employeeAttendance = attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear();
      const recordMonth = String(recordDate.getMonth() + 1).padStart(2, '0');
      
      return record.employeeId === employeeId && 
             recordYear === parseInt(year) && 
             recordMonth === monthNum;
    });
    
    if (employeeAttendance.length === 0) return 0;
    
    const presentCount = employeeAttendance.filter(record => record.status === 'Present').length;
    const totalDays = employeeAttendance.length;
    
    return totalDays > 0 ? (presentCount / totalDays) * 100 : 0;
  };

  // Calculate project completion based on targets (mock data or from other sources)
  const calculateProjectCompletion = (employeeId, month) => {
    const target = targets.find(t => t.employeeId === employeeId && t.month === month);
    return target ? target.projectCompletion : Math.floor(Math.random() * 40) + 60;
  };

  // Calculate task efficiency based on targets (mock data or from other sources)
  const calculateTaskEfficiency = (employeeId, month) => {
    const target = targets.find(t => t.employeeId === employeeId && t.month === month);
    return target ? target.taskEfficiency : Math.floor(Math.random() * 40) + 60;
  };

  const generateDefaultTargets = (employeeList) => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toISOString().slice(0, 7));
    }
    
    const defaultTargets = [];
    employeeList.forEach(emp => {
      months.forEach(month => {
        const attendancePercent = calculateAttendancePercentage(emp.employeeId, month);
        defaultTargets.push({
          id: Date.now() + Math.random() + emp.id,
          employeeId: emp.employeeId,
          employeeName: emp.name,
          department: emp.department,
          month: month,
          attendance: attendancePercent,
          projectCompletion: Math.floor(Math.random() * 40) + 60,
          taskEfficiency: Math.floor(Math.random() * 40) + 60,
          targetAmount: Math.floor(Math.random() * 50000) + 50000,
          previousTarget: Math.floor(Math.random() * 40000) + 40000
        });
      });
    });
    setTargets(defaultTargets);
    localStorage.setItem('performanceTargets', JSON.stringify(defaultTargets));
  };

  const calculatePerformanceScore = (attendance, projectCompletion, taskEfficiency) => {
    return (0.4 * attendance) + (0.4 * projectCompletion) + (0.2 * taskEfficiency);
  };

  const calculatePerformanceMetrics = () => {
    const totalEmployees = employees.length;
    
    let totalScore = 0;
    let highestAttendance = 0;
    let totalTargetCompleted = 0;
    
    const currentMonthTargets = targets.filter(t => t.month === selectedMonth);
    
    currentMonthTargets.forEach(target => {
      const score = calculatePerformanceScore(target.attendance, target.projectCompletion, target.taskEfficiency);
      totalScore += score;
      
      if (target.attendance > highestAttendance) {
        highestAttendance = target.attendance;
      }
      
      const completionRate = (target.targetAmount / (target.previousTarget || 1)) * 100;
      totalTargetCompleted += Math.min(completionRate, 100);
    });
    
    setPerformanceMetrics({
      totalEmployees: totalEmployees,
      averagePerformance: currentMonthTargets.length > 0 ? (totalScore / currentMonthTargets.length).toFixed(1) : 0,
      highestAttendance: highestAttendance,
      targetCompletion: currentMonthTargets.length > 0 ? (totalTargetCompleted / currentMonthTargets.length).toFixed(1) : 0
    });
  };

  const calculateTopEmployees = () => {
    const currentMonthTargets = targets.filter(t => t.month === selectedMonth);
    
    const employeesWithScore = currentMonthTargets.map(target => {
      const score = calculatePerformanceScore(target.attendance, target.projectCompletion, target.taskEfficiency);
      return {
        ...target,
        performanceScore: score
      };
    });
    
    const sorted = employeesWithScore.sort((a, b) => b.performanceScore - a.performanceScore);
    setTopEmployees(sorted.slice(0, 3));
  };

  const generateChartData = () => {
    // Get unique months from targets
    const uniqueMonths = [...new Set(targets.map(t => t.month))].sort();
    setAvailableMonths(uniqueMonths);
    
    let monthsToShow = uniqueMonths;
    if (selectedMonthForChart !== 'all') {
      monthsToShow = [selectedMonthForChart];
    } else {
      monthsToShow = uniqueMonths.slice(-6); // Last 6 months
    }
    
    const chartData = monthsToShow.map(month => {
      const monthTargets = targets.filter(t => t.month === month);
      let avgScore = 0;
      let avgAttendance = 0;
      let avgProject = 0;
      
      if (monthTargets.length > 0) {
        avgScore = monthTargets.reduce((sum, t) => 
          sum + calculatePerformanceScore(t.attendance, t.projectCompletion, t.taskEfficiency), 0
        ) / monthTargets.length;
        
        avgAttendance = monthTargets.reduce((sum, t) => sum + t.attendance, 0) / monthTargets.length;
        avgProject = monthTargets.reduce((sum, t) => sum + t.projectCompletion, 0) / monthTargets.length;
      }
      
      const date = new Date(month + '-01');
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      return {
        month: `${monthName} ${year}`,
        monthKey: month,
        score: avgScore.toFixed(1),
        attendance: avgAttendance.toFixed(1),
        project: avgProject.toFixed(1),
        year: year
      };
    });
    
    setPerformanceChartData(chartData);
  };

  const applyFilters = () => {
    let filtered = [...targets];
    
    filtered = filtered.filter(target => target.month === selectedMonth);
    
    if (searchTerm) {
      filtered = filtered.filter(target => 
        target.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTargets(filtered);
    setCurrentPage(1);
  };

  const startEditing = (target) => {
    setEditingRow(target.id);
    setEditFormData({
      projectCompletion: target.projectCompletion,
      taskEfficiency: target.taskEfficiency,
      targetAmount: target.targetAmount,
      previousTarget: target.previousTarget
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const saveEdit = async (id) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedTargets = targets.map(target => {
      if (target.id === id) {
        const attendance = calculateAttendancePercentage(target.employeeId, target.month);
        return {
          ...target,
          ...editFormData,
          attendance: attendance
        };
      }
      return target;
    });
    
    setTargets(updatedTargets);
    localStorage.setItem('performanceTargets', JSON.stringify(updatedTargets));
    setEditingRow(null);
    setLoading(false);
    alert('Target updated successfully!');
  };

  const cancelEditing = () => {
    setEditingRow(null);
    setEditFormData({});
  };

  const addNewTarget = async () => {
    if (!newTarget.employeeId) {
      alert('Please select an employee');
      return;
    }
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const employee = employees.find(emp => emp.employeeId === newTarget.employeeId);
    const attendancePercent = calculateAttendancePercentage(newTarget.employeeId, newTarget.month);
    
    const targetToAdd = {
      id: Date.now(),
      employeeId: newTarget.employeeId,
      employeeName: employee?.name || 'Unknown',
      department: employee?.department || 'Unknown',
      month: newTarget.month,
      attendance: attendancePercent,
      projectCompletion: newTarget.projectCompletion || 0,
      taskEfficiency: newTarget.taskEfficiency || 0,
      targetAmount: newTarget.targetAmount || 0,
      previousTarget: newTarget.previousTarget || 0
    };
    
    const updatedTargets = [...targets, targetToAdd];
    setTargets(updatedTargets);
    localStorage.setItem('performanceTargets', JSON.stringify(updatedTargets));
    setShowAddModal(false);
    setNewTarget({
      employeeId: '',
      month: new Date().toISOString().slice(0, 7),
      projectCompletion: 0,
      taskEfficiency: 0,
      targetAmount: 0
    });
    setLoading(false);
    alert('Target added successfully!');
  };

  const deleteTarget = async (id) => {
    if (window.confirm('Are you sure you want to delete this target?')) {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedTargets = targets.filter(target => target.id !== id);
      setTargets(updatedTargets);
      localStorage.setItem('performanceTargets', JSON.stringify(updatedTargets));
      setLoading(false);
      alert('Target deleted successfully!');
    }
  };

  const syncAttendanceData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedTargets = targets.map(target => {
      const newAttendance = calculateAttendancePercentage(target.employeeId, target.month);
      return {
        ...target,
        attendance: newAttendance
      };
    });
    
    setTargets(updatedTargets);
    localStorage.setItem('performanceTargets', JSON.stringify(updatedTargets));
    setLoading(false);
    alert('Attendance data synced successfully!');
  };

  const exportToCSV = () => {
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Month', 'Attendance %', 'Project Completion %', 'Task Efficiency %', 'Target Amount', 'Previous Target', 'Growth %', 'Performance Score'];
    const csvData = filteredTargets.map(target => {
      const score = calculatePerformanceScore(target.attendance, target.projectCompletion, target.taskEfficiency);
      const growth = ((target.targetAmount - target.previousTarget) / target.previousTarget * 100).toFixed(1);
      return [
        target.employeeId,
        target.employeeName,
        target.department,
        target.month,
        target.attendance.toFixed(1),
        target.projectCompletion,
        target.taskEfficiency,
        target.targetAmount,
        target.previousTarget,
        `${growth}%`,
        score.toFixed(1)
      ];
    });
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance_${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert('Performance data exported successfully!');
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTargets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTargets.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getGrowthColor = (current, previous) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (current, previous) => {
    if (current > previous) return <FiTrendingUp className="inline mr-1" size={14} />;
    if (current < previous) return <FiTrendingDown className="inline mr-1" size={14} />;
    return null;
  };

  // Pie chart data for performance distribution
  const performanceDistribution = [
    { name: 'Excellent (>90)', value: targets.filter(t => {
      const score = calculatePerformanceScore(t.attendance, t.projectCompletion, t.taskEfficiency);
      return score >= 90 && t.month === selectedMonth;
    }).length, color: '#10B981' },
    { name: 'Good (75-89)', value: targets.filter(t => {
      const score = calculatePerformanceScore(t.attendance, t.projectCompletion, t.taskEfficiency);
      return score >= 75 && score < 90 && t.month === selectedMonth;
    }).length, color: '#3B82F6' },
    { name: 'Average (60-74)', value: targets.filter(t => {
      const score = calculatePerformanceScore(t.attendance, t.projectCompletion, t.taskEfficiency);
      return score >= 60 && score < 75 && t.month === selectedMonth;
    }).length, color: '#F59E0B' },
    { name: 'Poor (<60)', value: targets.filter(t => {
      const score = calculatePerformanceScore(t.attendance, t.projectCompletion, t.taskEfficiency);
      return score < 60 && t.month === selectedMonth;
    }).length, color: '#EF4444' }
  ];

  const getPerformanceBadge = (score) => {
    if (score >= 90) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Excellent</span>;
    if (score >= 75) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Good</span>;
    if (score >= 60) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Average</span>;
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Needs Improvement</span>;
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Performance Management</h1>
        <p className="text-gray-500 mt-1">Track employee performance, targets, and achievements</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Employees</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{performanceMetrics.totalEmployees}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FiUsers className="text-indigo-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Average Performance</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{performanceMetrics.averagePerformance}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiAward className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Highest Attendance</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{performanceMetrics.highestAttendance}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Target Completion</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{performanceMetrics.targetCompletion}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FiTarget className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Employees Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {topEmployees[0] && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <FiAward className="text-4xl mb-2" />
                <p className="text-sm opacity-90">Employee of the Month</p>
                <p className="text-2xl font-bold mt-1">{topEmployees[0].employeeName}</p>
                <p className="text-sm opacity-90 mt-1">{topEmployees[0].department}</p>
                <p className="text-lg font-semibold mt-2">Score: {topEmployees[0].performanceScore?.toFixed(0)}</p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                🥇
              </div>
            </div>
          </div>
        )}

        {topEmployees[1] && (
          <div className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <FiAward className="text-3xl mb-2" />
                <p className="text-sm opacity-90">Second Best</p>
                <p className="text-2xl font-bold mt-1">{topEmployees[1].employeeName}</p>
                <p className="text-sm opacity-90 mt-1">{topEmployees[1].department}</p>
                <p className="text-lg font-semibold mt-2">Score: {topEmployees[1].performanceScore?.toFixed(0)}</p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                🥈
              </div>
            </div>
          </div>
        )}

        {topEmployees[2] && (
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <FiStar className="text-3xl mb-2" />
                <p className="text-sm opacity-90">Third Best</p>
                <p className="text-2xl font-bold mt-1">{topEmployees[2].employeeName}</p>
                <p className="text-sm opacity-90 mt-1">{topEmployees[2].department}</p>
                <p className="text-lg font-semibold mt-2">Score: {topEmployees[2].performanceScore?.toFixed(0)}</p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                🥉
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Analytics Chart with Month Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FiTrendingUp className="text-indigo-600" />
              Performance Trend
            </h3>
            <div className="flex gap-2">
              <select
                value={selectedMonthForChart}
                onChange={(e) => setSelectedMonthForChart(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white"
              >
                <option value="all">Last 6 Months</option>
                {availableMonths.map(month => {
                  const date = new Date(month + '-01');
                  return (
                    <option key={month} value={month}>
                      {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </option>
                  );
                })}
              </select>
              <button
                onClick={syncAttendanceData}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                title="Sync Attendance Data"
              >
                <FiRefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value}%`, '']} />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} name="Performance Score" dot={{ fill: '#6366F1', r: 4 }} />
                <Line type="monotone" dataKey="attendance" stroke="#10B981" strokeWidth={2} name="Attendance %" dot={{ fill: '#10B981', r: 4 }} />
                <Line type="monotone" dataKey="project" stroke="#F59E0B" strokeWidth={2} name="Project Completion %" dot={{ fill: '#F59E0B', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiPieChart className="text-indigo-600" />
            Performance Distribution ({selectedMonth})
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {performanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Employee Targets Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Employee Targets</h3>
              
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm flex items-center gap-2"
              >
                <FiPlus size={16} />
                Add Target
              </button>
              <button
                onClick={syncAttendanceData}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm flex items-center gap-2"
              >
                <FiRefreshCw size={16} />
                Sync Attendance
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm flex items-center gap-2"
              >
                <FiDownload size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-white"
              />
            </div>
            <div className="w-full sm:w-64">
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Targets Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Attendance %</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Project %</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Efficiency %</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Current Target</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Previous</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Growth</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Performance</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((target) => {
                const performanceScore = calculatePerformanceScore(target.attendance, target.projectCompletion, target.taskEfficiency);
                const growth = ((target.targetAmount - target.previousTarget) / target.previousTarget * 100).toFixed(1);
                
                return (
                  <tr key={target.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-600">{target.employeeId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{target.employeeName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{target.department}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${target.attendance >= 75 ? 'text-green-600' : target.attendance >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {target.attendance.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingRow === target.id ? (
                        <input
                          type="number"
                          name="projectCompletion"
                          value={editFormData.projectCompletion}
                          onChange={handleEditChange}
                          className="w-20 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                          min="0"
                          max="100"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">{target.projectCompletion}%</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingRow === target.id ? (
                        <input
                          type="number"
                          name="taskEfficiency"
                          value={editFormData.taskEfficiency}
                          onChange={handleEditChange}
                          className="w-20 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                          min="0"
                          max="100"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">{target.taskEfficiency}%</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingRow === target.id ? (
                        <input
                          type="number"
                          name="targetAmount"
                          value={editFormData.targetAmount}
                          onChange={handleEditChange}
                          className="w-28 px-2 py-1 text-right border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-gray-800">₹{target.targetAmount.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingRow === target.id ? (
                        <input
                          type="number"
                          name="previousTarget"
                          value={editFormData.previousTarget}
                          onChange={handleEditChange}
                          className="w-28 px-2 py-1 text-right border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">₹{target.previousTarget.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${getGrowthColor(target.targetAmount, target.previousTarget)}`}>
                        {getGrowthIcon(target.targetAmount, target.previousTarget)}
                        {growth}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getPerformanceBadge(performanceScore)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {editingRow === target.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(target.id)}
                              disabled={loading}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Save"
                            >
                              <FiSave size={16} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Cancel"
                            >
                              <FiX size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(target)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteTarget(target.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTargets.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTargets.length)} of {filteredTargets.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                      key={index}
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

        {filteredTargets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No performance targets found for {selectedMonth}</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Add new target →
            </button>
          </div>
        )}
      </div>

      {/* Add Target Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAddModal(false)}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full animate-fade-in">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Add New Performance Target</h3>
                <p className="text-sm text-gray-500 mt-1">Create a new performance target for an employee</p>
                <p className="text-xs text-green-600 mt-1">Note: Attendance % will be auto-calculated from Attendance module</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee *</label>
                  <select
                    value={newTarget.employeeId}
                    onChange={(e) => setNewTarget({ ...newTarget, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.employeeId}>{emp.name} ({emp.employeeId}) - {emp.department}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <input
                    type="month"
                    value={newTarget.month}
                    onChange={(e) => setNewTarget({ ...newTarget, month: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Completion %</label>
                    <input
                      type="number"
                      value={newTarget.projectCompletion}
                      onChange={(e) => setNewTarget({ ...newTarget, projectCompletion: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Task Efficiency %</label>
                    <input
                      type="number"
                      value={newTarget.taskEfficiency}
                      onChange={(e) => setNewTarget({ ...newTarget, taskEfficiency: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (₹)</label>
                    <input
                      type="number"
                      value={newTarget.targetAmount}
                      onChange={(e) => setNewTarget({ ...newTarget, targetAmount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Previous Target (₹)</label>
                    <input
                      type="number"
                      value={newTarget.previousTarget}
                      onChange={(e) => setNewTarget({ ...newTarget, previousTarget: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewTarget}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Target'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;