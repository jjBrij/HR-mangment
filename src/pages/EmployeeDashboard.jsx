// src/pages/EmployeeDashboard.jsx (Complete Fixed Version - No JSX Errors)
import React, { useState, useEffect } from 'react';
import {
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiSave,
  FiEdit2,
  FiX,
  FiActivity,
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiCheckSquare,
  FiPlus
} from 'react-icons/fi';
import { format, startOfMonth, eachDayOfInterval, startOfToday, isSameDay, endOfMonth } from 'date-fns';
import { useAppContext } from '../context/AppContext';

const EmployeeDashboard = () => {
  const { employees: globalEmployees, refreshData, performanceTargets } = useAppContext();
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [dailyTargets, setDailyTargets] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editingTarget, setEditingTarget] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [statistics, setStatistics] = useState({
    totalTarget: 0,
    completedTarget: 0,
    pendingTarget: 0,
    completionRate: 0
  });
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    loadEmployeeData();
  }, []);

  useEffect(() => {
    if (currentEmployee) {
      loadDailyTargets();
      syncWithPerformanceTarget();
    }
  }, [currentEmployee, selectedMonth, performanceTargets]);

  const loadEmployeeData = () => {
    const loggedInUser = sessionStorage.getItem('loggedInEmployee');
    let employee = null;

    if (loggedInUser) {
      employee = JSON.parse(loggedInUser);
    } else if (globalEmployees && globalEmployees.length > 0) {
      employee = globalEmployees[0];
      sessionStorage.setItem('loggedInEmployee', JSON.stringify(employee));
    }

    setCurrentEmployee(employee);
  };

  const syncWithPerformanceTarget = () => {
    if (!currentEmployee || !performanceTargets) return;

    const performanceTarget = performanceTargets.find(
      t => t.employeeId === currentEmployee.employeeId && t.month === selectedMonth
    );

    if (performanceTarget) {
      const totalTarget = performanceTarget.currentTarget || 0;
      setStatistics(prev => ({
        ...prev,
        totalTarget: totalTarget,
        pendingTarget: totalTarget - prev.completedTarget,
        completionRate: totalTarget > 0 ? (prev.completedTarget / totalTarget) * 100 : 0
      }));
    }
  };

  const loadDailyTargets = () => {
    const storedTargets = localStorage.getItem('dailyTargets');
    let targets = [];

    if (storedTargets) {
      targets = JSON.parse(storedTargets);
    }

    const employeeTargets = targets.filter(t =>
      t.employeeId === currentEmployee.employeeId &&
      t.month === selectedMonth
    );

    const startDate = startOfMonth(new Date(selectedMonth + '-01'));
    const currentDate = new Date();
    let endDate;

    if (format(currentDate, 'yyyy-MM') === selectedMonth) {
      endDate = currentDate;
    } else {
      endDate = endOfMonth(startDate);
    }

    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    const existingDates = employeeTargets.map(t => t.date);
    const missingTargets = [];

    daysInMonth.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      if (!existingDates.includes(dateStr)) {
        missingTargets.push({
          id: `${currentEmployee.employeeId}-${dateStr}`,
          employeeId: currentEmployee.employeeId,
          employeeName: currentEmployee.name,
          date: dateStr,
          completedAmount: 0,
          tasks: [],
          status: 'Pending',
          month: selectedMonth,
          createdAt: new Date().toISOString(),
          updatedAt: null
        });
      }
    });

    const allTargets = [...employeeTargets, ...missingTargets];
    allTargets.sort((a, b) => new Date(a.date) - new Date(b.date));

    setDailyTargets(allTargets);
    calculateStatistics(allTargets);
    setFilteredTargets([...allTargets].sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const calculateStatistics = (targets) => {
    const completedTarget = targets.reduce((sum, t) => sum + (t.completedAmount || 0), 0);

    let totalTarget = 0;
    if (performanceTargets && currentEmployee) {
      const performanceTarget = performanceTargets.find(
        t => t.employeeId === currentEmployee.employeeId && t.month === selectedMonth
      );
      totalTarget = performanceTarget?.currentTarget || 0;
    }

    const pendingTarget = totalTarget - completedTarget;
    const completionRate = totalTarget > 0 ? (completedTarget / totalTarget) * 100 : 0;

    setStatistics({
      totalTarget,
      completedTarget,
      pendingTarget: pendingTarget > 0 ? pendingTarget : 0,
      completionRate: completionRate
    });

    syncCompletedTargetToPerformance(completedTarget);
  };

  const syncCompletedTargetToPerformance = (completedTarget) => {
    if (!currentEmployee || !performanceTargets) return;

    const storedPerformanceTargets = localStorage.getItem('performanceTargets');
    if (!storedPerformanceTargets) return;

    let performanceList = JSON.parse(storedPerformanceTargets);
    const index = performanceList.findIndex(
      t => t.employeeId === currentEmployee.employeeId && t.month === selectedMonth
    );

    if (index !== -1) {
      performanceList[index].completedTarget = completedTarget;
      performanceList[index].updatedAt = new Date().toISOString();
      localStorage.setItem('performanceTargets', JSON.stringify(performanceList));

      if (refreshData) {
        refreshData();
      }
    }
  };

  const startEditing = (target) => {
    setEditingTarget(target.id);
    setEditFormData({
      completedAmount: target.completedAmount || 0
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setEditFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const saveEdit = async (id) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const storedTargets = localStorage.getItem('dailyTargets');
    let allTargets = storedTargets ? JSON.parse(storedTargets) : [];

    const existingIndex = allTargets.findIndex(t => t.id === id);
    const currentTarget = dailyTargets.find(t => t.id === id);

    const updatedTarget = {
      ...currentTarget,
      completedAmount: editFormData.completedAmount,
      tasks: editFormData.tasks || currentTarget.tasks || [],
      status: editFormData.completedAmount > 0 ? 'Completed' : 'Pending',
      updatedAt: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      allTargets[existingIndex] = updatedTarget;
    } else {
      allTargets.push(updatedTarget);
    }

    localStorage.setItem('dailyTargets', JSON.stringify(allTargets));

    const updatedDailyTargets = dailyTargets.map(t =>
      t.id === id ? updatedTarget : t
    );

    setDailyTargets(updatedDailyTargets);
    calculateStatistics(updatedDailyTargets);
    setFilteredTargets([...updatedDailyTargets].sort((a, b) => new Date(b.date) - new Date(a.date)));

    setEditingTarget(null);
    setEditFormData({});
    setNewTask('');
    setLoading(false);
    alert('Daily target updated successfully!');

    if (refreshData) {
      refreshData();
    }
  };

  const cancelEditing = () => {
    setEditingTarget(null);
    setEditFormData({});
    setNewTask('');
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const isEditable = (date) => {
    const today = startOfToday();
    const targetDate = new Date(date);
    return isSameDay(targetDate, today);
  };

  const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(date).getDay()];
  };

  if (!currentEmployee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 mb-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
              {currentEmployee.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{currentEmployee.name}</h1>
              <p className="text-indigo-200 mt-1">{currentEmployee.position} • {currentEmployee.department}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-indigo-200">
                <span className="flex items-center gap-1"><FiMail size={14} /> {currentEmployee.email}</span>
                <span className="flex items-center gap-1"><FiPhone size={14} /> {currentEmployee.phone || 'Not provided'}</span>
                <span className="flex items-center gap-1"><FiMapPin size={14} /> {currentEmployee.workLocation || 'Office'}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Target</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency(statistics.totalTarget)}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FiTarget className="text-indigo-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Completed Target</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(statistics.completedTarget)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Target</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(statistics.pendingTarget)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FiClock className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{statistics.completionRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-indigo-600" />
            <span className="font-medium text-gray-700">Select Month</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() - 1);
                setCurrentMonth(newMonth);
                setSelectedMonth(format(newMonth, 'yyyy-MM'));
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiChevronLeft size={18} />
            </button>
            <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            {format(currentMonth, 'yyyy-MM') < format(new Date(), 'yyyy-MM') && (
              <button
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setCurrentMonth(newMonth);
                  setSelectedMonth(format(newMonth, 'yyyy-MM'));
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiChevronRight size={18} />
              </button>
            )}
            <button
              onClick={() => {
                const today = new Date();
                setCurrentMonth(today);
                setSelectedMonth(format(today, 'yyyy-MM'));
              }}
              className="px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
            >
              Current Month
            </button>
          </div>
        </div>
      </div>

      {/* Daily Targets Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Daily Targets</h3>
          <p className="text-sm text-gray-500 mt-1">Track your daily performance</p>
          <p className="text-xs text-amber-600 mt-1">⚠️ You can only edit today's date. Past dates are read-only.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Daily Tasks</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTargets.length > 0 ? (
                filteredTargets.map((target) => {
                  const targetDate = new Date(target.date);
                  const isToday = isEditable(target.date);
                  const dayName = getDayName(target.date);

                  return (
                    <tr key={target.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm font-medium text-gray-800">
                            {format(targetDate, 'dd MMM')}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            ({dayName})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingTarget === target.id && isToday ? (
                          <div>
                            <label className="text-xs text-gray-500">Completed Amount (₹)</label>
                            <input
                              type="number"
                              name="completedAmount"
                              value={editFormData.completedAmount || ''}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                              min="0"
                              placeholder="Enter amount"
                            />
                          </div>
                        ) : (
                          <div>
                            {target.tasks && target.tasks.length > 0 ? (
                              <div className="space-y-1">
                                {target.tasks.slice(0, 3).map((task) => (
                                  <div key={task.id} className="flex items-center gap-2">
                                    <FiCheckSquare className={`text-xs ${task.completed ? 'text-green-500' : 'text-gray-400'}`} />
                                    <span className={`text-xs ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                                      {task.text.length > 30 ? task.text.substring(0, 30) + '...' : task.text}
                                    </span>
                                  </div>
                                ))}
                                {target.tasks.length > 3 && (
                                  <p className="text-xs text-gray-400">+{target.tasks.length - 3} more</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">No tasks added</p>
                            )}
                            {target.completedAmount > 0 && (
                              <p className="text-xs text-green-600 mt-1">Amount: {formatCurrency(target.completedAmount)}</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {target.completedAmount > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            <FiCheckCircle className="mr-1" size={12} /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            <FiClock className="mr-1" size={12} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingTarget === target.id ? (
                          <div className="flex items-center justify-center gap-2">
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
                          </div>
                        ) : (
                          isToday && (
                            <button
                              onClick={() => startEditing(target)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit Today's Target"
                            >
                              <FiEdit2 size={16} />
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <div className="text-center">
                      <FiTarget className="mx-auto text-gray-400 text-5xl mb-3" />
                      <p className="text-gray-500">No daily targets found for {format(currentMonth, 'MMMM yyyy')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Summary */}
      {statistics.totalTarget > 0 && (
        <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-3">Monthly Progress Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-medium">{statistics.completionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`${getProgressColor(statistics.completionRate)} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(statistics.completionRate, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-500">Target</p>
                <p className="text-sm font-semibold text-gray-800">{formatCurrency(statistics.totalTarget)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-sm font-semibold text-green-600">{formatCurrency(statistics.completedTarget)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-sm font-semibold text-orange-600">{formatCurrency(statistics.pendingTarget)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <FiActivity className="text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-800">How Daily Targets Work</h4>
            <p className="text-sm text-blue-700 mt-1">
              • You can only edit today's date. Past dates are locked.<br />
              • Add tasks for the day and mark them as completed.<br />
              • Enter the amount achieved for today.<br />
              • Your progress automatically syncs with the Performance dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;