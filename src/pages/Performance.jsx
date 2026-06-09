// src/pages/Performance.jsx - Fixed key generation
import React, { useState, useEffect } from 'react';
import {
  FiAward,
  FiStar,
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiTarget,
  FiCheckCircle,
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
  LineChart, Line, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { getCurrentUser } from '../services/authService';

// ─── helpers ────────────────────────────────────────────────────────────────

const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return isNaN(value) ? defaultValue : value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

// Create a unique key for each target
const getTargetKey = (target, index) => {
  if (target.id) return target.id;
  if (target.employee_id && target.month) return `${target.employee_id}_${target.month}`;
  return `target_${index}_${Date.now()}`;
};

// ─── component ──────────────────────────────────────────────────────────────

const Performance = () => {
  const { refreshData } = useAppContext();
  const currentUser = getCurrentUser();
  const isAdminOrHR = currentUser?.role === 'admin' || currentUser?.role === 'hr_manager';

  // ── state ─────────────────────────────────────────────────────────────────

  const [employees, setEmployees] = useState([]);
  const [targets, setTargets] = useState([]);
  const [allTargets, setAllTargets] = useState([]);
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
  const [dataLoading, setDataLoading] = useState(true);

  const [selectedMonthForChart, setSelectedMonthForChart] = useState('all');
  const [previousMonthPending, setPreviousMonthPending] = useState(0);
  const [calculatedFinalTarget, setCalculatedFinalTarget] = useState(0);
  const [previousMonthData, setPreviousMonthData] = useState(null);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalEmployees: 0,
    averagePerformance: 0,
    highestAttendance: 0,
    targetCompletion: 0
  });
  const [topEmployees, setTopEmployees] = useState([]);
  const [performanceChartData, setPerformanceChartData] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);

  // ── load on mount / month change ──────────────────────────────────────────

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  // re-run chart when chart filter changes
  useEffect(() => {
    if (allTargets.length > 0) generateChartData(allTargets);
  }, [selectedMonthForChart]);

  // auto-fill completed target preview
  useEffect(() => {
    const userTarget = newTarget.userEnteredTarget === '' ? 0 : Number(newTarget.userEnteredTarget);
    const finalTarget = userTarget + previousMonthPending;
    setCalculatedFinalTarget(finalTarget);

    if (
      !isAutoFilling &&
      (newTarget.completedTarget === '' || newTarget.completedTarget === null || newTarget.completedTarget === undefined)
    ) {
      setIsAutoFilling(true);
      setNewTarget(prev => ({ ...prev, completedTarget: finalTarget.toString() }));
      setTimeout(() => setIsAutoFilling(false), 100);
    }
  }, [newTarget.userEnteredTarget, previousMonthPending]);

  // recalculate pending when employee / month changes in modal
  useEffect(() => {
    if (newTarget.employeeId && newTarget.month) {
      calculatePreviousMonthPending(newTarget.employeeId, newTarget.month);
    }
  }, [newTarget.employeeId, newTarget.month]);

  // update available employees when modal opens / month changes
  useEffect(() => {
    if (showAddModal && newTarget.month) {
      filterAvailableEmployees(newTarget.month);
    }
  }, [showAddModal, newTarget.month, targets, employees]);

  // ── filter targets when search / month changes ────────────────────────────

  useEffect(() => {
    applyFilters();
  }, [targets, searchTerm]);

  // ── data loading ──────────────────────────────────────────────────────────

  const loadData = async () => {
    setDataLoading(true);
    try {
      // fetch employees
      const employeesRes = await api.get('/api/employees/');
      const employeeList = Array.isArray(employeesRes)
        ? employeesRes
        : (employeesRes.results || []);
      const validEmployees = employeeList.filter(
        emp => emp.name && emp.name.trim() !== '' && emp.name !== 'Unknown'
      );
      setEmployees(validEmployees);

      // fetch ALL targets (for charts + trend)
      const allTargetsRes = await api.get('/api/performance/targets/');
      const rawAll = Array.isArray(allTargetsRes)
        ? allTargetsRes
        : (allTargetsRes.results || []);

      console.log('Raw API response - count:', rawAll.length);

      const enriched = rawAll.map((target, idx) => {
        const employee = validEmployees.find(
          e => e.employee_id === target.employee_id || e.employeeId === target.employee_id
        );

        return {
          ...target,
          uniqueKey: getTargetKey(target, idx), // Create unique key for React
          employeeName: employee?.name || 'Unknown',
          department: employee?.department || 'N/A',
          attendance: safeNumber(target.attendance),
          current_target: safeNumber(target.current_target),
          completed_target: safeNumber(target.completed_target),
          previous_target: safeNumber(target.previous_target),
          user_entered_target: safeNumber(target.user_entered_target)
        };
      });

      setAllTargets(enriched);

      // filter to selected month
      const monthTargets = enriched.filter(
        t => t.month === selectedMonth && t.employeeName !== 'Unknown'
      );
      setTargets(monthTargets);
      setFilteredTargets(monthTargets);

      calculatePerformanceMetrics(monthTargets, validEmployees);
      calculateTopEmployees(monthTargets);
      generateChartData(enriched);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // ── sync attendance via API ───────────────────────────────────────────────

  const syncAttendanceData = async () => {
    if (targets.length === 0) {
      alert('No performance targets found to sync');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/performance/sync-attendance/', { month: selectedMonth });
      alert('Attendance data synced successfully!');
      loadData();
    } catch (error) {
      console.warn('Sync endpoint not available, reloading data', error);
      loadData();
    } finally {
      setLoading(false);
    }
  };

  // ── metric calculations ───────────────────────────────────────────────────

  const calculatePerformanceMetrics = (targetsList, employeeList) => {
    const totalEmployees = (employeeList || employees).filter(
      e => e.name && e.name !== 'Unknown'
    ).length;

    let totalScore = 0;
    let highestAttendance = 0;
    let totalCompletionRate = 0;

    targetsList.forEach(target => {
      const attendance = safeNumber(target.attendance);
      const currentTarget = safeNumber(target.current_target);
      const completedTarget = safeNumber(target.completed_target);
      const completionRate = currentTarget > 0 ? (completedTarget / currentTarget) * 100 : 0;
      const score = attendance * 0.4 + completionRate * 0.6;
      totalScore += score;
      if (attendance > highestAttendance) highestAttendance = attendance;
      totalCompletionRate += completionRate;
    });

    setPerformanceMetrics({
      totalEmployees,
      averagePerformance: targetsList.length > 0 ? (totalScore / targetsList.length).toFixed(1) : 0,
      highestAttendance: highestAttendance.toFixed(1),
      targetCompletion: targetsList.length > 0 ? (totalCompletionRate / targetsList.length).toFixed(1) : 0
    });
  };

  const calculateTopEmployees = (targetsList) => {
    const withScores = targetsList.map(target => {
      const attendance = safeNumber(target.attendance);
      const currentTarget = safeNumber(target.current_target);
      const completedTarget = safeNumber(target.completed_target);
      const completionRate = currentTarget > 0 ? (completedTarget / currentTarget) * 100 : 0;
      const score = attendance * 0.4 + completionRate * 0.6;
      return { ...target, performanceScore: score };
    });
    const sorted = withScores.sort((a, b) => b.performanceScore - a.performanceScore);
    setTopEmployees(sorted.slice(0, 3));
  };

  const generateChartData = (targetsSource) => {
    const source = targetsSource || allTargets;
    const uniqueMonths = [...new Set(source.map(t => t.month))].sort();
    setAvailableMonths(uniqueMonths);

    let monthsToShow =
      selectedMonthForChart === 'all' ? uniqueMonths.slice(-6) : [selectedMonthForChart];

    const chartData = monthsToShow.map(month => {
      const monthTargets = source.filter(t => t.month === month && t.employeeName !== 'Unknown');
      let avgScore = 0, avgAttendance = 0, avgCompletion = 0;

      if (monthTargets.length > 0) {
        monthTargets.forEach(target => {
          const attendance = safeNumber(target.attendance);
          const currentTarget = safeNumber(target.current_target);
          const completedTarget = safeNumber(target.completed_target);
          const completionRate = currentTarget > 0 ? (completedTarget / currentTarget) * 100 : 0;
          avgScore += attendance * 0.4 + completionRate * 0.6;
          avgAttendance += attendance;
          avgCompletion += completionRate;
        });
        avgScore /= monthTargets.length;
        avgAttendance /= monthTargets.length;
        avgCompletion /= monthTargets.length;
      }

      const date = new Date(month + '-01');
      return {
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        score: avgScore.toFixed(1),
        attendance: avgAttendance.toFixed(1),
        completionRate: avgCompletion.toFixed(1)
      };
    });

    setPerformanceChartData(chartData);
  };

  // ── helpers ───────────────────────────────────────────────────────────────

  const applyFilters = () => {
    let filtered = [...targets];
    if (searchTerm) {
      filtered = filtered.filter(t =>
        (t.employeeName && t.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.employee_id && String(t.employee_id).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.department && t.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredTargets(filtered);
    setCurrentPage(1);
  };

  const filterAvailableEmployees = (month) => {
    const validEmployees = employees.filter(
      emp => emp.name && emp.name.trim() !== '' && emp.name !== 'Unknown'
    );
    const employeesWithTarget = allTargets
      .filter(t => t.month === month && t.employeeName !== 'Unknown')
      .map(t => t.employee_id);
    const available = validEmployees.filter(emp => {
      const empId = emp.employee_id || emp.employeeId;
      return !employeesWithTarget.includes(empId);
    });
    setAvailableEmployees(available);
  };

  const calculatePreviousMonthPending = (employeeId, currentMonth) => {
    const [year, month] = currentMonth.split('-');
    let prevYear = parseInt(year);
    let prevMonth = parseInt(month) - 1;
    if (prevMonth === 0) { prevMonth = 12; prevYear -= 1; }
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const previousTarget = allTargets.find(
      t =>
        String(t.employee_id) === String(employeeId) &&
        t.month === prevMonthStr
    );

    if (previousTarget) {
      const pending = safeNumber(previousTarget.current_target) - safeNumber(previousTarget.completed_target);
      setPreviousMonthPending(pending > 0 ? pending : 0);
      setPreviousMonthData(previousTarget);
    } else {
      setPreviousMonthPending(0);
      setPreviousMonthData(null);
    }
  };

  const calculateGrowth = (currentTarget, previousTarget) => {
    if (!previousTarget || previousTarget === 0) return 0;
    return ((currentTarget - previousTarget) / previousTarget) * 100;
  };

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

  const getPerformanceLevel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };

  const getPerformanceBadge = (performance) => {
    switch (performance) {
      case 'Excellent': return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Excellent</span>;
      case 'Good': return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Good</span>;
      case 'Average': return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Average</span>;
      default: return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Needs Improvement</span>;
    }
  };

  // ── CRUD actions ──────────────────────────────────────────────────────────

  const startEditing = (target) => {
    const targetKey = target.uniqueKey || getTargetKey(target);
    setEditingRow(targetKey);
    setEditFormData({
      current_target: safeNumber(target.current_target),
      completed_target: safeNumber(target.completed_target),
      previous_target: safeNumber(target.previous_target)
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseFloat(value) || 0;
    setEditFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const saveEdit = async (target) => {
    const employeeId = target.employee_id;
    const month = target.month;

    if (!employeeId || !month) {
      console.error('Missing employee_id or month for saveEdit');
      alert('Cannot save: Missing identification data');
      return;
    }

    setLoading(true);
    try {
      await api.put(
        '/api/performance/targets/update-by-employee-month/',
        {
          employee_id: employeeId,
          month: month,
          current_target: editFormData.current_target,
          completed_target: editFormData.completed_target,
          previous_target: editFormData.previous_target
        }
      );
      setEditingRow(null);
      setEditFormData({});
      alert('Target updated successfully!');
      refreshData();
      loadData();
    } catch (error) {
      console.error('Error updating target:', error);
      alert('Update failed. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
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

    setLoading(true);
    try {
      const existing = allTargets.find(
        t => t.employee_id === newTarget.employeeId && t.month === newTarget.month
      );
      if (existing) {
        alert('Target already exists for this employee and month');
        setLoading(false);
        return;
      }

      const targetData = {
        employee_id: newTarget.employeeId,
        month: newTarget.month,
        year: parseInt(newTarget.month.split('-')[0]),
        user_entered_target: userEnteredNum,
        current_target: finalCurrentTarget,
        completed_target: 0,
        previous_target: safeNumber(previousMonthData?.current_target),
        previous_pending: previousMonthPending,
        attendance: 0
      };

      await api.post('/api/performance/targets/', targetData);

      alert(
        `Target added successfully for ${newTarget.month}!\n\n` +
        `Final Target: ₹${finalCurrentTarget.toLocaleString()}\n` +
        `Previous Pending: ₹${previousMonthPending.toLocaleString()}`
      );

      refreshData();
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
      setSelectedMonth(newTarget.month);
      loadData();
    } catch (error) {
      console.error('Error adding target:', error);
      const errMsg = error.response?.data
        ? Object.values(error.response.data).flat().join(', ')
        : 'Failed to add target. Please try again.';
      alert(` ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteTarget = async (target) => {
    const employeeId = target.employee_id;
    const month = target.month;

    console.log('Delete Target:', { employeeId, month, target });

    if (!employeeId || !month) {
      console.error('Cannot delete: Missing employee_id or month');
      alert('Cannot delete target: Missing identification data. Please refresh and try again.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete target for ${target.employeeName} (${month})?`)) return;

    setLoading(true);
    try {
      await api.delete(`/api/performance/targets/delete-by-employee-month/?employee_id=${employeeId}&month=${month}`);
      alert('Target deleted successfully!');
      refreshData();
      loadData();
    } catch (error) {
      console.error('Error deleting target:', error);
      alert('Delete failed. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredTargets.length === 0) {
      alert('No data to export');
      return;
    }
    const headers = ['Employee', 'Department', 'Attendance %', 'Current Target', 'Completed Target', 'Pending Target', 'Growth %', 'Performance'];
    const csvData = filteredTargets.map(target => {
      const currentTarget = safeNumber(target.current_target);
      const completedTarget = safeNumber(target.completed_target);
      const attendance = safeNumber(target.attendance);
      const completionRate = currentTarget > 0 ? (completedTarget / currentTarget) * 100 : 0;
      const performanceScore = attendance * 0.4 + completionRate * 0.6;
      const growth = calculateGrowth(currentTarget, safeNumber(target.previous_target));
      return [
        target.employeeName || 'Unknown',
        target.department || 'N/A',
        `${attendance.toFixed(1)}%`,
        `₹${currentTarget.toLocaleString()}`,
        `₹${completedTarget.toLocaleString()}`,
        `₹${(currentTarget - completedTarget).toLocaleString()}`,
        `${growth.toFixed(1)}%`,
        getPerformanceLevel(performanceScore)
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

  // ── pagination ────────────────────────────────────────────────────────────

  const validFiltered = filteredTargets.filter(t => t.employeeName !== 'Unknown');
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = validFiltered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(validFiltered.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ── performance distribution (pie) ───────────────────────────────────────

  const performanceDistribution = [
    {
      name: 'Excellent', color: '#10B981',
      value: targets.filter(t => {
        const cr = safeNumber(t.current_target) > 0 ? (safeNumber(t.completed_target) / safeNumber(t.current_target)) * 100 : 0;
        return (safeNumber(t.attendance) * 0.4 + cr * 0.6) >= 90;
      }).length
    },
    {
      name: 'Good', color: '#3B82F6',
      value: targets.filter(t => {
        const cr = safeNumber(t.current_target) > 0 ? (safeNumber(t.completed_target) / safeNumber(t.current_target)) * 100 : 0;
        const s = safeNumber(t.attendance) * 0.4 + cr * 0.6;
        return s >= 75 && s < 90;
      }).length
    },
    {
      name: 'Average', color: '#F59E0B',
      value: targets.filter(t => {
        const cr = safeNumber(t.current_target) > 0 ? (safeNumber(t.completed_target) / safeNumber(t.current_target)) * 100 : 0;
        const s = safeNumber(t.attendance) * 0.4 + cr * 0.6;
        return s >= 60 && s < 75;
      }).length
    },
    {
      name: 'Needs Improvement', color: '#EF4444',
      value: targets.filter(t => {
        const cr = safeNumber(t.current_target) > 0 ? (safeNumber(t.completed_target) / safeNumber(t.current_target)) * 100 : 0;
        return (safeNumber(t.attendance) * 0.4 + cr * 0.6) < 60;
      }).length
    }
  ];

  // ── loading state ─────────────────────────────────────────────────────────

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading performance data...</p>
        </div>
      </div>
    );
  }

  // ── render ────────────────────────────────────────────────────────────────

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

      {/* Top 3 Employees */}
      {topEmployees.length > 0 && (
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
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">🥇</div>
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
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">🥈</div>
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
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">🥉</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      {allTargets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Line chart */}
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
                  disabled={loading}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  title="Sync Attendance Data"
                >
                  <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
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

          {/* Pie chart */}
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
            <div className="flex gap-3 flex-wrap">
              {isAdminOrHR && (
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
                  <FiPlus size={16} /> Add Target
                </button>
              )}
              {targets.length > 0 && isAdminOrHR && (
                <button
                  onClick={syncAttendanceData}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm flex items-center gap-2"
                >
                  <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync Attendance
                </button>
              )}
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm flex items-center gap-2"
              >
                <FiDownload size={16} /> Export
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
                placeholder="Search by employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-white"
              />
            </div>
            <div className="w-full sm:w-64 relative">
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

        {/* Table / Empty state */}
        {targets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTarget className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-500">No performance targets found for {selectedMonth}</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Target" to create your first performance target</p>
            {isAdminOrHR && (
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
            )}
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
                    {isAdminOrHR && (
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.length > 0 ? (
                    currentItems.map((target, idx) => {
                      const attendance = safeNumber(target.attendance);
                      const currentTarget = safeNumber(target.current_target);
                      const completedTarget = safeNumber(target.completed_target);
                      const previousTarget = safeNumber(target.previous_target);
                      const pendingTarget = currentTarget - completedTarget;
                      const completionRate = currentTarget > 0 ? (completedTarget / currentTarget) * 100 : 0;
                      const performanceScore = attendance * 0.4 + completionRate * 0.6;
                      const performance = getPerformanceLevel(performanceScore);
                      const growth = calculateGrowth(currentTarget, previousTarget);
                      const uniqueKey = target.uniqueKey || getTargetKey(target, idx);

                      return (
                        <tr key={uniqueKey} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-800">{target.employeeName}</p>
                              <p className="text-xs text-gray-500">{target.department || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-medium ${attendance >= 75 ? 'text-green-600' : attendance >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {attendance.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {editingRow === uniqueKey ? (
                              <input
                                type="number"
                                name="current_target"
                                value={editFormData.current_target}
                                onChange={handleEditChange}
                                className="w-32 px-2 py-1 text-right border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                                min="0"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-gray-800">₹{currentTarget.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {editingRow === uniqueKey ? (
                              <input
                                type="number"
                                name="completed_target"
                                value={editFormData.completed_target}
                                onChange={handleEditChange}
                                className="w-32 px-2 py-1 text-right border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                                min="0"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-green-600">₹{completedTarget.toLocaleString()}</span>
                            )}
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
                          {isAdminOrHR && (
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {editingRow === uniqueKey ? (
                                  <>
                                    <button
                                      onClick={() => saveEdit(target)}
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
                                      onClick={() => deleteTarget(target)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                      title="Delete"
                                    >
                                      <FiTrash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={isAdminOrHR ? 8 : 7} className="text-center py-12">
                        <p className="text-gray-500">No valid performance data found for {selectedMonth}</p>
                        {isAdminOrHR && (
                          <button
                            onClick={() => {
                              filterAvailableEmployees(selectedMonth);
                              setShowAddModal(true);
                            }}
                            className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Add new target →
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {validFiltered.length > itemsPerPage && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, validFiltered.length)} of {validFiltered.length} entries
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
                    if (totalPages <= 7) pageNumber = index + 1;
                    else if (currentPage <= 4) pageNumber = index + 1;
                    else if (currentPage >= totalPages - 3) pageNumber = totalPages - 6 + index;
                    else pageNumber = currentPage - 3 + index;

                    if (pageNumber >= 1 && pageNumber <= totalPages) {
                      return (
                        <button
                          key={index}
                          onClick={() => paginate(pageNumber)}
                          className={`px-3 py-1 rounded-lg transition ${currentPage === pageNumber ? 'bg-indigo-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAddModal(false)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full animate-fade-in">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Add New Performance Target</h3>
                <p className="text-sm text-gray-500 mt-1">Create a new performance target for an employee</p>
                <p className="text-xs text-green-600 mt-1">Note: Attendance % will be auto-calculated from Attendance module</p>
                <p className="text-xs text-blue-600 mt-1 font-semibold">Note: Final Target = Your Entered Target + Previous Month's Pending Target</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Employee select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee *</label>
                  <select
                    value={newTarget.employeeId}
                    onChange={(e) => setNewTarget({ ...newTarget, employeeId: e.target.value, userEnteredTarget: '', completedTarget: '' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                  >
                    <option value="">Select Employee</option>
                    {availableEmployees.map(emp => {
                      const empId = emp.employee_id || emp.employeeId;
                      return (
                        <option key={empId} value={empId}>
                          {emp.name} ({empId}) - {emp.department}
                        </option>
                      );
                    })}
                  </select>
                  {availableEmployees.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">All employees already have targets for this month</p>
                  )}
                </div>

                {/* Month */}
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

                {/* Previous month pending info */}
                {previousMonthPending > 0 && previousMonthData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <FiInfo className="text-blue-600 mt-0.5" size={16} />
                      <div className="text-sm">
                        <p className="text-blue-800 font-medium">Previous Month's Data</p>
                        <p className="text-blue-600">Target: ₹{safeNumber(previousMonthData.current_target).toLocaleString()}</p>
                        <p className="text-blue-600">Completed: ₹{safeNumber(previousMonthData.completed_target).toLocaleString()}</p>
                        <p className="text-blue-600 font-semibold">Pending: ₹{previousMonthPending.toLocaleString()}</p>
                        <p className="text-xs text-blue-600 mt-1">This pending amount will be automatically added to your target</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Target amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Target Amount for{' '}
                    {newTarget.month ? new Date(newTarget.month + '-01').toLocaleString('default', { month: 'long' }) : 'Month'} (₹) *
                  </label>
                  <input
                    type="number"
                    value={newTarget.userEnteredTarget}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewTarget({ ...newTarget, userEnteredTarget: val === '' ? '' : Number(val) });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                    placeholder="Enter your target amount (e.g., 5000)"
                    min="0"
                    step="1000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Example: If you enter 5000, final target will be 5000 + previous pending</p>
                </div>

                {/* Calculation preview */}
                {newTarget.userEnteredTarget !== '' && Number(newTarget.userEnteredTarget) > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm">
                      <p className="text-green-800 font-medium mb-2">Target Calculation Preview:</p>
                      <div className="space-y-1 text-green-700">
                        <p>Your Entered Target: ₹{Number(newTarget.userEnteredTarget).toLocaleString()}</p>
                        {previousMonthPending > 0 && (
                          <>
                            <p>+ Previous Pending: ₹{previousMonthPending.toLocaleString()}</p>
                            <div className="border-t border-green-200 my-1" />
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