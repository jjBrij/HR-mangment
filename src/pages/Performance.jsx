// src/pages/Performance.jsx - With Action Buttons (Edit & Delete)
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
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiInfo
} from 'react-icons/fi';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

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
    userEnteredTarget: '',
    completedTarget: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedMonthForChart, setSelectedMonthForChart] = useState('all');
  const [previousMonthPending, setPreviousMonthPending] = useState(0);
  const [calculatedFinalTarget, setCalculatedFinalTarget] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [previousMonthData, setPreviousMonthData] = useState(null);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

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
  }, [refreshKey]);

  useEffect(() => {
    applyFilters();
    calculatePerformanceMetrics();
    calculateTopEmployees();
    generateChartData();
  }, [employees, targets, attendanceData, searchTerm, selectedMonth, selectedMonthForChart]);

  // Update available employees when month changes in add modal
  useEffect(() => {
    if (showAddModal && newTarget.month) {
      filterAvailableEmployees(newTarget.month);
    }
  }, [showAddModal, newTarget.month, targets, employees]);

  // Watch for employee selection in add modal
  useEffect(() => {
    if (newTarget.employeeId && newTarget.month) {
      calculatePreviousMonthPending(newTarget.employeeId, newTarget.month);
    }
  }, [newTarget.employeeId, newTarget.month]);

  // Calculate final target and auto-populate completed target ONLY when empty
  useEffect(() => {
    const userTarget = newTarget.userEnteredTarget === '' ? 0 : Number(newTarget.userEnteredTarget);
    const finalTarget = userTarget + previousMonthPending;
    setCalculatedFinalTarget(finalTarget);

    if (!isAutoFilling && (newTarget.completedTarget === '' || newTarget.completedTarget === null || newTarget.completedTarget === undefined)) {
      setIsAutoFilling(true);
      setNewTarget(prev => ({ ...prev, completedTarget: finalTarget.toString() }));
      setTimeout(() => setIsAutoFilling(false), 100);
    }
  }, [newTarget.userEnteredTarget, previousMonthPending]);

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

  // Clean up orphaned targets
  const cleanupOrphanedTargets = () => {
    const storedEmployees = localStorage.getItem('employees');
    const storedTargets = localStorage.getItem('performanceTargets');

    if (!storedTargets) return [];

    let targetsList = JSON.parse(storedTargets);

    if (!storedEmployees || JSON.parse(storedEmployees).length === 0) {
      localStorage.setItem('performanceTargets', JSON.stringify([]));
      return [];
    }

    const employeesList = JSON.parse(storedEmployees);
    const validEmployeeIds = employeesList.map(emp => emp.employeeId || emp.id);

    const cleanedTargets = targetsList.filter(target => {
      if (!target.employeeId) return false;
      const employeeExists = validEmployeeIds.includes(target.employeeId);
      const hasValidName = target.employeeName &&
        target.employeeName !== 'Unknown' &&
        target.employeeName.trim() !== '';
      return employeeExists && hasValidName;
    });

    const updatedTargets = cleanedTargets.map(target => {
      const matchingEmployee = employeesList.find(emp => (emp.employeeId || emp.id) === target.employeeId);
      if (matchingEmployee) {
        return {
          ...target,
          employeeName: matchingEmployee.name,
          department: matchingEmployee.department
        };
      }
      return target;
    });

    if (updatedTargets.length !== targetsList.length) {
      localStorage.setItem('performanceTargets', JSON.stringify(updatedTargets));
      console.log(`Cleaned up ${targetsList.length - updatedTargets.length} orphaned/invalid targets`);
    }

    return updatedTargets;
  };

  const filterAvailableEmployees = (month) => {
    const validEmployees = employees.filter(emp =>
      emp.name && emp.name.trim() !== '' && emp.name !== 'Unknown'
    );

    const employeesWithTarget = targets
      .filter(t => t.month === month && t.employeeName !== 'Unknown')
      .map(t => t.employeeId);

    const available = validEmployees.filter(emp => !employeesWithTarget.includes(emp.employeeId));
    setAvailableEmployees(available);
  };

  const loadData = () => {
    const storedEmployees = localStorage.getItem('employees');
    let employeeList = [];

    if (storedEmployees) {
      const parsedEmployees = JSON.parse(storedEmployees);
      employeeList = parsedEmployees.filter(emp =>
        emp.name && emp.name.trim() !== '' && emp.name !== 'Unknown'
      );

      if (employeeList.length !== parsedEmployees.length) {
        localStorage.setItem('employees', JSON.stringify(employeeList));
      }
    }
    setEmployees(employeeList);

    const storedAttendance = localStorage.getItem('attendanceData');
    if (storedAttendance && JSON.parse(storedAttendance).length > 0) {
      setAttendanceData(JSON.parse(storedAttendance));
    }

    const cleanedTargetsFromStorage = cleanupOrphanedTargets();
    let targetList = [];

    if (cleanedTargetsFromStorage && cleanedTargetsFromStorage.length > 0) {
      targetList = cleanedTargetsFromStorage.filter(target =>
        target.employeeName &&
        target.employeeName !== 'Unknown' &&
        target.employeeName.trim() !== ''
      );

      targetList = targetList.map(target => {
        const matchingEmployee = employeeList.find(
          emp => (emp.employeeId || emp.id) === target.employeeId
        );

        if (matchingEmployee) {
          return {
            ...target,
            employeeName: matchingEmployee.name,
            department: matchingEmployee.department
          };
        }
        return target;
      });

      if (targetList.length !== cleanedTargetsFromStorage.length) {
        localStorage.setItem('performanceTargets', JSON.stringify(targetList));
      }
      setTargets(targetList);
    } else {
      setTargets([]);
    }
  };

  const calculatePreviousMonthPending = (employeeId, currentMonth) => {
    const [year, month] = currentMonth.split('-');
    let prevYear = year;
    let prevMonth = parseInt(month) - 1;

    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = parseInt(year) - 1;
    }

    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    const previousTarget = targets.find(t => t.employeeId === employeeId && t.month === prevMonthStr);

    if (previousTarget) {
      const pendingTarget = (previousTarget.currentTarget || 0) - (previousTarget.completedTarget || 0);
      setPreviousMonthPending(pendingTarget > 0 ? pendingTarget : 0);
      setPreviousMonthData(previousTarget);
    } else {
      setPreviousMonthPending(0);
      setPreviousMonthData(null);
    }
  };

  const handleUserTargetChange = (value) => {
    const numValue = value === '' ? '' : Number(value);
    setNewTarget({ ...newTarget, userEnteredTarget: numValue });
  };

  const handleCompletedTargetChange = (value) => {
    setNewTarget({ ...newTarget, completedTarget: value });
  };

  const getPreviousMonthTarget = (employeeId, currentMonth) => {
    const [year, month] = currentMonth.split('-');
    let prevYear = year;
    let prevMonth = parseInt(month) - 1;

    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = parseInt(year) - 1;
    }

    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    const previousTarget = targets.find(t => t.employeeId === employeeId && t.month === prevMonthStr);
    return previousTarget ? previousTarget.currentTarget : 0;
  };

  const calculateAttendancePercentage = (employeeId, month) => {
    if (!attendanceData.length) return 0;

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

  const calculatePerformanceScore = (attendance, completionRate) => {
    return (0.4 * (attendance || 0)) + (0.6 * (completionRate || 0));
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };

  const calculateCompletionRate = (completedTarget, currentTarget) => {
    if (!currentTarget || currentTarget === 0) return 0;
    return (completedTarget / currentTarget) * 100;
  };

  const calculateGrowth = (currentTarget, previousTarget) => {
    if (!previousTarget || previousTarget === 0) return 0;
    return ((currentTarget - previousTarget) / previousTarget) * 100;
  };

  const calculatePerformanceMetrics = () => {
    const totalEmployees = employees.filter(emp => emp.name && emp.name !== 'Unknown').length;
    let totalScore = 0;
    let highestAttendance = 0;
    let totalCompletionRate = 0;
    const currentMonthTargets = targets.filter(t => t.month === selectedMonth && t.employeeName !== 'Unknown');

    currentMonthTargets.forEach(target => {
      const completionRate = calculateCompletionRate(target.completedTarget, target.currentTarget);
      const score = calculatePerformanceScore(target.attendance, completionRate);
      totalScore += score;
      if (target.attendance > highestAttendance) {
        highestAttendance = target.attendance;
      }
      totalCompletionRate += completionRate;
    });

    setPerformanceMetrics({
      totalEmployees: totalEmployees,
      averagePerformance: currentMonthTargets.length > 0 ? (totalScore / currentMonthTargets.length).toFixed(1) : 0,
      highestAttendance: highestAttendance,
      targetCompletion: currentMonthTargets.length > 0 ? (totalCompletionRate / currentMonthTargets.length).toFixed(1) : 0
    });
  };

  const calculateTopEmployees = () => {
    const currentMonthTargets = targets.filter(t => t.month === selectedMonth && t.employeeName !== 'Unknown');
    const employeesWithScore = currentMonthTargets.map(target => {
      const completionRate = calculateCompletionRate(target.completedTarget, target.currentTarget);
      const score = calculatePerformanceScore(target.attendance, completionRate);
      return { ...target, performanceScore: score };
    });
    const sorted = employeesWithScore.sort((a, b) => b.performanceScore - a.performanceScore);
    setTopEmployees(sorted.slice(0, 3));
  };

  const generateChartData = () => {
    const uniqueMonths = [...new Set(targets.map(t => t.month))].sort();
    setAvailableMonths(uniqueMonths);
    let monthsToShow = uniqueMonths;
    if (selectedMonthForChart !== 'all') {
      monthsToShow = [selectedMonthForChart];
    } else {
      monthsToShow = uniqueMonths.slice(-6);
    }

    const chartData = monthsToShow.map(month => {
      const monthTargets = targets.filter(t => t.month === month && t.employeeName !== 'Unknown');
      let avgScore = 0;
      let avgAttendance = 0;
      let avgCompletionRate = 0;

      if (monthTargets.length > 0) {
        avgScore = monthTargets.reduce((sum, t) => {
          const completionRate = calculateCompletionRate(t.completedTarget, t.currentTarget);
          return sum + calculatePerformanceScore(t.attendance, completionRate);
        }, 0) / monthTargets.length;
        avgAttendance = monthTargets.reduce((sum, t) => sum + (t.attendance || 0), 0) / monthTargets.length;
        avgCompletionRate = monthTargets.reduce((sum, t) =>
          sum + calculateCompletionRate(t.completedTarget, t.currentTarget), 0
        ) / monthTargets.length;
      }

      const date = new Date(month + '-01');
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      return {
        month: `${monthName} ${year}`,
        monthKey: month,
        score: avgScore.toFixed(1),
        attendance: avgAttendance.toFixed(1),
        completionRate: avgCompletionRate.toFixed(1),
        year: year
      };
    });
    setPerformanceChartData(chartData);
  };

  const applyFilters = () => {
    let filtered = [...targets];
    filtered = filtered.filter(target => target.month === selectedMonth && target.employeeName !== 'Unknown');
    if (searchTerm) {
      filtered = filtered.filter(target =>
        (target.employeeName && target.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (target.employeeId && target.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (target.department && target.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredTargets(filtered);
    setCurrentPage(1);
  };

  const startEditing = (target) => {
    setEditingRow(target.id);
    setEditFormData({
  currentTarget: target.currentTarget || 0,
  previousTarget: target.previousTarget || 0,
  userEnteredTarget: target.userEnteredTarget || 0
});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setEditFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const saveEdit = async (id) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedTargets = targets.map(target => {
      if (target.id === id) {
        const attendance = calculateAttendancePercentage(target.employeeId, target.month);
        return {
          ...target,
          currentTarget: editFormData.currentTarget,
          completedTarget: target.completedTarget,
          previousTarget: editFormData.previousTarget,
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
    setRefreshKey(prev => prev + 1);
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

    if (!newTarget.userEnteredTarget || newTarget.userEnteredTarget === '') {
      alert('Please enter a valid target amount');
      return;
    }

    const userEnteredNum = Number(newTarget.userEnteredTarget);
    if (isNaN(userEnteredNum) || userEnteredNum <= 0) {
      alert('Please enter a valid target amount greater than 0');
      return;
    }

    const finalCurrentTarget = userEnteredNum + previousMonthPending;

    let completedTargetNum = 0;


    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    let employee = employees.find(emp => emp.employeeId === newTarget.employeeId);

    if (!employee) {
      const storedEmployees = localStorage.getItem('employees');
      if (storedEmployees) {
        const allEmployees = JSON.parse(storedEmployees);
        employee = allEmployees.find(emp => emp.employeeId === newTarget.employeeId);
      }
    }

    if (!employee) {
      alert('Employee not found');
      setLoading(false);
      return;
    }

    if (!employee.name || employee.name === 'Unknown') {
      alert('Invalid employee data. Please check the employee record.');
      setLoading(false);
      return;
    }

    const attendancePercent = calculateAttendancePercentage(newTarget.employeeId, newTarget.month);
    const previousTargetValue = getPreviousMonthTarget(newTarget.employeeId, newTarget.month);

    const targetToAdd = {
      id: Date.now(),
      employeeId: employee.employeeId,
      employeeName: employee.name,
      department: employee.department || 'N/A',
      month: newTarget.month,
      userEnteredTarget: userEnteredNum,
      currentTarget: finalCurrentTarget,
      completedTarget: completedTargetNum,
      previousTarget: previousTargetValue,
      attendance: attendancePercent,
      previousPending: previousMonthPending
    };

    const updatedTargets = [...targets, targetToAdd];
    setTargets(updatedTargets);
    localStorage.setItem('performanceTargets', JSON.stringify(updatedTargets));
    setSelectedMonth(newTarget.month);

    setShowAddModal(false);
    setNewTarget({
      employeeId: '',
      month: new Date().toISOString().slice(0, 7),
      userEnteredTarget: '',
      completedTarget: ''
    });
    setPreviousMonthPending(0);
    setCalculatedFinalTarget(0);
    setPreviousMonthData(null);
    setLoading(false);
    setRefreshKey(prev => prev + 1);

    alert(`Target added successfully for ${newTarget.month}!\n\nFinal Target Amount: 
      ₹${finalCurrentTarget.toLocaleString()}\nCompleted Target: ₹${completedTargetNum.toLocaleString()}\nPending Target:
       ₹${(finalCurrentTarget - completedTargetNum).toLocaleString()}`);
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
      setRefreshKey(prev => prev + 1);
    }
  };

  const syncAttendanceData = async () => {
    if (targets.length === 0) {
      alert('No performance targets found to sync');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedTargets = targets.map(target => {
      const newAttendance = calculateAttendancePercentage(target.employeeId, target.month);
      return { ...target, attendance: newAttendance };
    });

    setTargets(updatedTargets);
    localStorage.setItem('performanceTargets', JSON.stringify(updatedTargets));
    setLoading(false);
    alert('Attendance data synced successfully!');
    setRefreshKey(prev => prev + 1);
  };

  const exportToCSV = () => {
    if (filteredTargets.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Employee', 'Department', 'Attendance %', 'Current Target', 'Completed Target', 'Pending Target', 'Growth %', 'Performance'];
    const csvData = filteredTargets.map(target => {
      const currentTarget = target.currentTarget || 0;
      const completedTarget = target.completedTarget || 0;
      const pendingTarget = currentTarget - completedTarget;
      const growth = calculateGrowth(currentTarget, target.previousTarget || 0);
      const completionRate = calculateCompletionRate(completedTarget, currentTarget);
      const performanceScore = calculatePerformanceScore(target.attendance || 0, completionRate);
      const performance = getPerformanceLevel(performanceScore);

      return [
        target.employeeName || 'Unknown',
        target.department || 'N/A',
        `${(target.attendance || 0).toFixed(1)}%`,
        `₹${currentTarget.toLocaleString()}`,
        `₹${completedTarget.toLocaleString()}`,
        `₹${pendingTarget.toLocaleString()}`,
        `${growth.toFixed(1)}%`,
        performance
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

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <FiTrendingUp className="inline mr-1" size={14} />;
    if (growth < 0) return <FiTrendingDown className="inline mr-1" size={14} />;
    return null;
  };

  const performanceDistribution = [
    {
      name: 'Excellent', value: targets.filter(t => {
        if (t.month !== selectedMonth || t.employeeName === 'Unknown') return false;
        const completionRate = calculateCompletionRate(t.completedTarget, t.currentTarget);
        const score = calculatePerformanceScore(t.attendance || 0, completionRate);
        return score >= 90;
      }).length, color: '#10B981'
    },
    {
      name: 'Good', value: targets.filter(t => {
        if (t.month !== selectedMonth || t.employeeName === 'Unknown') return false;
        const completionRate = calculateCompletionRate(t.completedTarget, t.currentTarget);
        const score = calculatePerformanceScore(t.attendance || 0, completionRate);
        return score >= 75 && score < 90;
      }).length, color: '#3B82F6'
    },
    {
      name: 'Average', value: targets.filter(t => {
        if (t.month !== selectedMonth || t.employeeName === 'Unknown') return false;
        const completionRate = calculateCompletionRate(t.completedTarget, t.currentTarget);
        const score = calculatePerformanceScore(t.attendance || 0, completionRate);
        return score >= 60 && score < 75;
      }).length, color: '#F59E0B'
    },
    {
      name: 'Needs Improvement', value: targets.filter(t => {
        if (t.month !== selectedMonth || t.employeeName === 'Unknown') return false;
        const completionRate = calculateCompletionRate(t.completedTarget, t.currentTarget);
        const score = calculatePerformanceScore(t.attendance || 0, completionRate);
        return score < 60;
      }).length, color: '#EF4444'
    }
  ];

  const getPerformanceBadge = (performance) => {
    switch (performance) {
      case 'Excellent': return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Excellent</span>;
      case 'Good': return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Good</span>;
      case 'Average': return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Average</span>;
      default: return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Needs Improvement</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Performance Management</h1>
        <p className="text-gray-500 mt-1">Track employee performance, targets, and achievements</p>
        <p className="text-xs text-amber-600 mt-1">⚠️ Targets must be added manually using the "Add Target" button</p>
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
              <p className="text-sm text-gray-500 font-medium">Avg Completion Rate</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{performanceMetrics.targetCompletion}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FiTarget className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Employees Section */}
      {topEmployees.length > 0 && topEmployees[0] && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {topEmployees[0] && topEmployees[0].employeeName !== 'Unknown' && (
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

          {topEmployees[1] && topEmployees[1].employeeName !== 'Unknown' && (
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

          {topEmployees[2] && topEmployees[2].employeeName !== 'Unknown' && (
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
      )}

      {/* Performance Analytics Chart */}
      {targets.length > 0 && (
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
                  <Line type="monotone" dataKey="completionRate" stroke="#F59E0B" strokeWidth={2} name="Completion Rate %" dot={{ fill: '#F59E0B', r: 4 }} />
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
      )}

      {/* Employee Targets Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Employee Performance Table</h3>
              <p className="text-sm text-gray-500 mt-1">Track employee targets and performance metrics</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (employees.length === 0) {
                    alert('No employees found. Please add employees first.');
                    return;
                  }
                  filterAvailableEmployees(selectedMonth);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm flex items-center gap-2"
              >
                <FiPlus size={16} />
                Add Target
              </button>
              {targets.length > 0 && (
                <>
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
                </>
              )}
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
                placeholder="Search by employee name..."
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

        {/* Performance Table */}
        {targets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTarget className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-500">No performance targets added yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Target" to create your first performance target</p>
            <button
              onClick={() => {
                if (employees.length === 0) {
                  alert('No employees found. Please add employees first.');
                  return;
                }
                filterAvailableEmployees(selectedMonth);
                setShowAddModal(true);
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm"
            >
              Add Your First Target
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Attendance %</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Current Target</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Completed Target</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Pending Target</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Growth %</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Performance</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.filter(t => t.employeeName !== 'Unknown').length > 0 ? (
                    currentItems.filter(t => t.employeeName !== 'Unknown').map((target) => {
                      const currentTarget = target.currentTarget || 0;
                      const completedTarget = target.completedTarget || 0;
                      const pendingTarget = currentTarget - completedTarget;
                      const growth = calculateGrowth(currentTarget, target.previousTarget || 0);
                      const completionRate = calculateCompletionRate(completedTarget, currentTarget);
                      const performanceScore = calculatePerformanceScore(target.attendance || 0, completionRate);
                      const performance = getPerformanceLevel(performanceScore);

                      return (
                        <tr key={target.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-800">{target.employeeName}</p>
                              <p className="text-xs text-gray-500">{target.department || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-medium ${(target.attendance || 0) >= 75 ? 'text-green-600' : (target.attendance || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {(target.attendance || 0).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {editingRow === target.id ? (
                              <input
                                type="number"
                                name="currentTarget"
                                value={editFormData.currentTarget}
                                onChange={handleEditChange}
                                className="w-32 px-2 py-1 text-right border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                                min="0"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-gray-800">₹{currentTarget.toLocaleString()}</span>
                            )}
                          </td>


                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-green-600">
                              ₹{completedTarget.toLocaleString()}
                            </span>
                          </td>



                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-orange-600">₹{pendingTarget.toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-medium ${getGrowthColor(growth)}`}>
                              {getGrowthIcon(growth)}
                              {growth.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getPerformanceBadge(performance)}
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
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-12">
                        <p className="text-gray-500">No valid performance data found for {selectedMonth}</p>
                        <button
                          onClick={() => {
                            filterAvailableEmployees(selectedMonth);
                            setShowAddModal(true);
                          }}
                          className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Add new target →
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredTargets.filter(t => t.employeeName !== 'Unknown').length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTargets.filter(t => t.employeeName !== 'Unknown').length)} of {filteredTargets.filter(t => t.employeeName !== 'Unknown').length} entries
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
                          className={`px-3 py-1 rounded-lg transition ${currentPage === pageNumber
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
          </>
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
                <p className="text-xs text-blue-600 mt-1 font-semibold">Note: Final Target = Your Entered Target + Previous Month's Pending Target</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee *</label>
                  <select
                    value={newTarget.employeeId}
                    onChange={(e) => {
                      setNewTarget({ ...newTarget, employeeId: e.target.value, userEnteredTarget: '', completedTarget: '' });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                  >
                    <option value="">Select Employee</option>
                    {availableEmployees.map(emp => (
                      <option key={emp.id} value={emp.employeeId}>
                        {emp.name} ({emp.employeeId}) - {emp.department}
                      </option>
                    ))}
                  </select>
                  {availableEmployees.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">All employees have targets for this month</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <input
                    type="month"
                    value={newTarget.month}
                    onChange={(e) => {
                      setNewTarget({ ...newTarget, month: e.target.value, employeeId: '', userEnteredTarget: '', completedTarget: '' });
                      filterAvailableEmployees(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                  />
                </div>

                {/* Show previous month pending info */}
                {previousMonthPending > 0 && previousMonthData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <FiInfo className="text-blue-600 mt-0.5" size={16} />
                      <div className="text-sm">
                        <p className="text-blue-800 font-medium">Previous Month's Data</p>
                        <p className="text-blue-600">Target: ₹{previousMonthData.currentTarget?.toLocaleString()}</p>
                        <p className="text-blue-600">Completed: ₹{previousMonthData.completedTarget?.toLocaleString()}</p>
                        <p className="text-blue-600 font-semibold">Pending: ₹{previousMonthPending.toLocaleString()}</p>
                        <p className="text-xs text-blue-600 mt-1">This pending amount will be automatically added to your target</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Target Amount for {newTarget.month ? new Date(newTarget.month + '-01').toLocaleString('default', { month: 'long' }) : 'Month'} (₹) *
                  </label>
                  <input
                    type="number"
                    value={newTarget.userEnteredTarget}
                    onChange={(e) => handleUserTargetChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                    placeholder="Enter your target amount (e.g., 5000)"
                    min="0"
                    step="1000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Example: If you enter 5000, final target will be 5000 + previous pending</p>
                </div>

                {/* Show calculation preview */}
                {newTarget.userEnteredTarget !== '' && Number(newTarget.userEnteredTarget) > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm">
                      <p className="text-green-800 font-medium mb-2">Target Calculation Preview:</p>
                      <div className="space-y-1 text-green-700">
                        <p>Your Entered Target: ₹{Number(newTarget.userEnteredTarget).toLocaleString()}</p>
                        {previousMonthPending > 0 && (
                          <>
                            <p>+ Previous Pending: ₹{previousMonthPending.toLocaleString()}</p>
                            <div className="border-t border-green-200 my-1"></div>
                            <p className="font-semibold">Final Current Target: ₹{calculatedFinalTarget.toLocaleString()}</p>
                          </>
                        )}
                        {previousMonthPending === 0 && (
                          <p className="font-semibold">Final Current Target: ₹{Number(newTarget.userEnteredTarget).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}










              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setPreviousMonthPending(0);
                    setCalculatedFinalTarget(0);
                    setPreviousMonthData(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewTarget}
                  disabled={loading || !newTarget.userEnteredTarget || !newTarget.employeeId}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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