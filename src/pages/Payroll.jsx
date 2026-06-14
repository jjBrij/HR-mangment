// src/pages/Payroll.jsx - Updated with ₹ (Rupee) symbol
import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiDownload, 
  FiCheckCircle, 
  FiClock, 
  FiUser, 
  FiBriefcase, 
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiPrinter,
  FiMail,
  FiSearch,
  FiSave,
  FiX,
  FiEdit2,
  FiRefreshCw
} from 'react-icons/fi';

const Payroll = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showSalaryBreakdown, setShowSalaryBreakdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingRow, setEditingRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load data on mount and when refreshTrigger changes
  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // Listen for storage changes (when employees are added/deleted from other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'employees' || e.key === 'payrollData') {
        loadData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Clean up orphaned payroll records (employees that no longer exist)
  const cleanupOrphanedPayroll = (payrollList, employeeList) => {
    if (!payrollList.length) return [];
    
    if (employeeList.length === 0) {
      // If no employees exist, clear all payroll records
      localStorage.setItem('payrollData', JSON.stringify([]));
      return [];
    }
    
    const validEmployeeIds = employeeList.map(emp => emp.employeeId || emp.id);
    const cleanedPayroll = payrollList.filter(payroll => 
      payroll.employeeId && validEmployeeIds.includes(payroll.employeeId)
    );
    
    // Update employee names and departments to match current data
    const updatedPayroll = cleanedPayroll.map(payroll => {
      const matchingEmployee = employeeList.find(emp => (emp.employeeId || emp.id) === payroll.employeeId);
      if (matchingEmployee) {
        return {
          ...payroll,
          name: matchingEmployee.name,
          email: matchingEmployee.email,
          department: matchingEmployee.department,
          position: matchingEmployee.position,
          basicSalary: matchingEmployee.basicSalary || payroll.basicSalary,
          bankName: matchingEmployee.bankName || payroll.bankName,
          accountNumber: matchingEmployee.accountNumber || payroll.accountNumber
        };
      }
      return payroll;
    });
    
    if (updatedPayroll.length !== payrollList.length) {
      localStorage.setItem('payrollData', JSON.stringify(updatedPayroll));
    }
    
    return updatedPayroll;
  };

  // Sync payroll data with employees (create missing payroll records)
  const syncPayrollWithEmployees = (employeeList, existingPayroll) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const syncedPayroll = [...existingPayroll];
    
    // Check for employees without payroll records
    employeeList.forEach(emp => {
      const hasPayroll = existingPayroll.some(p => p.employeeId === emp.employeeId);
      if (!hasPayroll && emp.name && emp.name !== 'Unknown') {
        // Create new payroll record for employee
        const newPayroll = {
          id: Date.now() + Math.random(),
          employeeId: emp.employeeId,
          name: emp.name,
          email: emp.email,
          department: emp.department,
          position: emp.position,
          basicSalary: parseFloat(emp.basicSalary) || 0,
          allowance: 0,
          bonus: 0,
          deductions: 0,
          providentFund: 0,
          professionalTax: 0,
          incomeTax: 0,
          netSalary: parseFloat(emp.basicSalary) || 0,
          status: 'Unpaid',
          paymentDate: null,
          joinDate: emp.joinDate,
          bankName: emp.bankName,
          accountNumber: emp.accountNumber,
          ifscCode: emp.ifscCode,
          month: currentMonth
        };
        syncedPayroll.push(newPayroll);
      }
    });
    
    return syncedPayroll;
  };

  const loadData = () => {
    // Load employees from localStorage - NO DUMMY DATA
    const storedEmployees = localStorage.getItem('employees');
    let employeeList = [];
    
    if (storedEmployees && JSON.parse(storedEmployees).length > 0) {
      employeeList = JSON.parse(storedEmployees);
      // Filter out invalid employees
      employeeList = employeeList.filter(emp => emp.name && emp.name.trim() !== '' && emp.name !== 'Unknown');
    }
    // If no employees, keep empty array (no dummy data)
    setEmployees(employeeList);
    
    // Load payroll data
    let storedPayroll = localStorage.getItem('payrollData');
    let payrollList = [];
    
    if (storedPayroll && JSON.parse(storedPayroll).length > 0) {
      payrollList = JSON.parse(storedPayroll);
    }
    
    // Clean up orphaned payroll records
    const cleanedPayroll = cleanupOrphanedPayroll(payrollList, employeeList);
    
    // Sync payroll with current employees (create missing records)
    const syncedPayroll = syncPayrollWithEmployees(employeeList, cleanedPayroll);
    
    // Save synced payroll back to localStorage if changes were made
    if (syncedPayroll.length !== cleanedPayroll.length) {
      localStorage.setItem('payrollData', JSON.stringify(syncedPayroll));
    }
    
    setPayrollData(syncedPayroll);
  };

  // Calculate summary statistics
  const totalPayroll = payrollData.reduce((sum, emp) => sum + (emp.netSalary || 0), 0);
  const paidEmployees = payrollData.filter(emp => emp.status === 'Paid').length;
  const unpaidEmployees = payrollData.filter(emp => emp.status !== 'Paid').length;
  const pendingAmount = payrollData
    .filter(emp => emp.status !== 'Paid')
    .reduce((sum, emp) => sum + (emp.netSalary || 0), 0);

  // Filter employees based on search and status
  const filteredEmployees = payrollData.filter(emp => {
    const matchesSearch = 
      (emp.name && emp.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || (emp.status && emp.status.toLowerCase() === filterStatus.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Start editing a row
  const startEditing = (employee) => {
    setEditingRow(employee.id);
    setEditFormData({
      bonus: employee.bonus || 0,
      deductions: employee.deductions || 0,
      status: employee.status || 'Unpaid'
    });
  };

  // Handle edit input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ 
      ...prev, 
      [name]: name === 'bonus' || name === 'deductions' ? parseFloat(value) || 0 : value 
    }));
  };

  // Save edited row
  const saveEdit = async (id) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedPayroll = payrollData.map(emp => {
      if (emp.id === id) {
        const updatedEmp = {
          ...emp,
          bonus: editFormData.bonus,
          deductions: editFormData.deductions,
          status: editFormData.status,
          netSalary: (emp.basicSalary || 0) + (emp.allowance || 0) + editFormData.bonus - editFormData.deductions
        };
        if (editFormData.status === 'Paid' && emp.status !== 'Paid') {
          updatedEmp.paymentDate = new Date().toISOString().split('T')[0];
        } else if (editFormData.status !== 'Paid') {
          updatedEmp.paymentDate = null;
        }
        return updatedEmp;
      }
      return emp;
    });
    
    setPayrollData(updatedPayroll);
    localStorage.setItem('payrollData', JSON.stringify(updatedPayroll));
    setEditingRow(null);
    setLoading(false);
    alert('Payroll details updated successfully!');
    setRefreshTrigger(prev => prev + 1);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingRow(null);
    setEditFormData({});
  };

  // Handle payment status update
  const handleUpdateStatus = async (id, newStatus) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedPayroll = payrollData.map(emp =>
      emp.id === id 
        ? { 
            ...emp, 
            status: newStatus, 
            paymentDate: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : null 
          }
        : emp
    );
    
    setPayrollData(updatedPayroll);
    localStorage.setItem('payrollData', JSON.stringify(updatedPayroll));
    setLoading(false);
    alert(`Payment ${newStatus === 'Paid' ? 'processed' : 'updated'} successfully!`);
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle bulk action
  const handleBulkAction = async (action) => {
    if (action === 'payAll') {
      if (window.confirm('Process all unpaid payments?')) {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updatedPayroll = payrollData.map(emp =>
          emp.status !== 'Paid'
            ? { ...emp, status: 'Paid', paymentDate: new Date().toISOString().split('T')[0] }
            : emp
        );
        
        setPayrollData(updatedPayroll);
        localStorage.setItem('payrollData', JSON.stringify(updatedPayroll));
        setLoading(false);
        alert('All unpaid payments processed successfully!');
        setRefreshTrigger(prev => prev + 1);
      }
    } else if (action === 'export') {
      exportToCSV();
    } else if (action === 'refresh') {
      loadData();
      alert('Payroll data refreshed!');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (payrollData.length === 0) {
      alert('No payroll data to export');
      return;
    }
    
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Basic Salary', 'Bonus', 'Deductions', 'Net Salary', 'Status', 'Payment Date'];
    const csvData = payrollData.map(emp => [
      emp.employeeId || '',
      emp.name || '',
      emp.email || '',
      emp.department || '',
      emp.basicSalary || 0,
      emp.bonus || 0,
      emp.deductions || 0,
      emp.netSalary || 0,
      emp.status || 'Unpaid',
      emp.paymentDate || 'N/A'
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert('Payroll data exported successfully!');
  };

  // View salary breakdown
  const viewSalaryBreakdown = (employee) => {
    setSelectedEmployee(employee);
    setShowSalaryBreakdown(true);
  };

  // Close salary breakdown modal
  const closeSalaryBreakdown = () => {
    setShowSalaryBreakdown(false);
    setSelectedEmployee(null);
  };

  // Send payslip email
  const sendPayslip = async (employee) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    alert(`Payslip sent to ${employee.email}`);
    setLoading(false);
  };

  // Print payslip
  const printPayslip = (employee) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${employee.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .payslip-title { font-size: 20px; margin-top: 10px; }
            .employee-details { margin-bottom: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f3f4f6; }
            .total { font-weight: bold; background: #e0e7ff; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">HRMS Company</div>
            <div class="payslip-title">Payslip for ${employee.name}</div>
          </div>
          <div class="employee-details">
            <p><strong>Employee ID:</strong> ${employee.employeeId}</p>
            <p><strong>Department:</strong> ${employee.department}</p>
            <p><strong>Payment Date:</strong> ${employee.paymentDate || 'N/A'}</p>
          </div>
          <table>
            <tr><th>Description</th><th>Amount (₹)</th></tr>
            <tr><td>Basic Salary</td><td>₹${(employee.basicSalary || 0).toLocaleString('en-IN')}</td></tr>
            <tr><td>Allowance</td><td class="text-green-600">+₹${(employee.allowance || 0).toLocaleString('en-IN')}</td></tr>
            <tr><td>Bonus</td><td class="text-green-600">+₹${(employee.bonus || 0).toLocaleString('en-IN')}</td></tr>
            <tr><td>Provident Fund</td><td class="text-red-600">-₹${(employee.providentFund || 0).toLocaleString('en-IN')}</td></tr>
            <tr><td>Professional Tax</td><td class="text-red-600">-₹${(employee.professionalTax || 0).toLocaleString('en-IN')}</td></tr>
            <tr><td>Income Tax</td><td class="text-red-600">-₹${(employee.incomeTax || 0).toLocaleString('en-IN')}</td></tr>
            <tr class="total"><td>Net Salary</td><td>₹${(employee.netSalary || 0).toLocaleString('en-IN')}</td></tr>
          </table>
          <p style="margin-top: 30px; text-align: center;">This is a computer-generated document. No signature required.</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Format account number
  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return 'Not provided';
    if (accountNumber.length > 8) {
      return `****${accountNumber.slice(-4)}`;
    }
    return accountNumber;
  };

  // Format currency in Indian Rupees
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Payroll Management</h1>
        <p className="text-gray-500 mt-1">Manage and process employee payroll efficiently</p>
        {employees.length === 0 && (
          <p className="text-sm text-amber-600 mt-2">⚠️ No employees found. Please add employees first.</p>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Payroll</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalPayroll)}</p>
              <p className="text-xs text-green-600 mt-2">Current month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiDollarSign className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Paid Employees</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{paidEmployees}</p>
              <p className="text-xs text-green-600 mt-2">{payrollData.length > 0 ? Math.round((paidEmployees / payrollData.length) * 100) : 0}% of total</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{unpaidEmployees}</p>
              <p className="text-xs text-orange-600 mt-2">{formatCurrency(pendingAmount)} pending</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FiClock className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => handleBulkAction('payAll')}
            disabled={loading || payrollData.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <FiDollarSign size={16} />
            Process All Unpaid
          </button>
          <button
            onClick={() => handleBulkAction('refresh')}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm flex items-center gap-2"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => handleBulkAction('export')}
            disabled={payrollData.length === 0}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <FiDownload size={16} />
            Export Report
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 text-sm w-64"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      {payrollData.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiDollarSign className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Payroll Data</h3>
          <p className="text-gray-500 mb-4">No employees found. Add employees to see payroll data.</p>
          <button
            onClick={() => window.location.href = '/employees/add'}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm"
          >
            Add Employee
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Employee ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name / Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bank Account</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Basic Salary</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bonus</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Deductions</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Net Pay</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition group">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-600">{employee.employeeId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Joined: {employee.joinDate}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FiBriefcase className="text-gray-400 text-sm" />
                        <span className="text-sm text-gray-700">{employee.department}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{employee.position}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{employee.bankName || 'N/A'}</span>
                      <p className="text-xs font-mono text-gray-500">{formatAccountNumber(employee.accountNumber)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-gray-700">{formatCurrency(employee.basicSalary)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingRow === employee.id ? (
                        <input
                          type="number"
                          name="bonus"
                          value={editFormData.bonus}
                          onChange={handleEditChange}
                          className="w-24 px-2 py-1 text-right border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                          min="0"
                        />
                      ) : (
                        <span className="text-sm text-green-600">+{formatCurrency(employee.bonus)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingRow === employee.id ? (
                        <input
                          type="number"
                          name="deductions"
                          value={editFormData.deductions}
                          onChange={handleEditChange}
                          className="w-24 px-2 py-1 text-right border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                          min="0"
                        />
                      ) : (
                        <span className="text-sm text-red-600">-{formatCurrency(employee.deductions)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-gray-800">{formatCurrency(employee.netSalary)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingRow === employee.id ? (
                        <select
                          name="status"
                          value={editFormData.status}
                          onChange={handleEditChange}
                          className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                        >
                          <option value="Unpaid">Unpaid</option>
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          employee.status === 'Paid' 
                            ? 'bg-green-100 text-green-700' 
                            : employee.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {employee.status === 'Paid' ? <FiCheckCircle className="mr-1 text-xs" /> : <FiClock className="mr-1 text-xs" />}
                          {employee.status || 'Unpaid'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {editingRow === employee.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(employee.id)}
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
                              onClick={() => startEditing(employee)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit Bonus/Deductions"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => viewSalaryBreakdown(employee)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                            {employee.status !== 'Paid' && (
                              <button
                                onClick={() => handleUpdateStatus(employee.id, 'Paid')}
                                disabled={loading}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                              >
                                Pay Now
                              </button>
                            )}
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
          {filteredEmployees.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} entries
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
        </div>
      )}

      {/* Salary Breakdown Modal */}
      {showSalaryBreakdown && selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeSalaryBreakdown}></div>
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
              
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Salary Breakdown</h2>
                  <p className="text-sm text-gray-500">{selectedEmployee.name} • {selectedEmployee.employeeId}</p>
                </div>
                <button onClick={closeSalaryBreakdown} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                  <FiX size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Salary Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Salary Breakdown</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Basic Salary</span>
                          <span className="font-semibold text-gray-800">{formatCurrency(selectedEmployee.basicSalary)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Allowance</span>
                          <span className="text-green-600">+{formatCurrency(selectedEmployee.allowance)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Bonus</span>
                          <span className="text-green-600">+{formatCurrency(selectedEmployee.bonus)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Provident Fund</span>
                          <span className="text-red-600">-{formatCurrency(selectedEmployee.providentFund)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Professional Tax</span>
                          <span className="text-red-600">-{formatCurrency(selectedEmployee.professionalTax)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Income Tax</span>
                          <span className="text-red-600">-{formatCurrency(selectedEmployee.incomeTax)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t-2 border-gray-200">
                      <div className="flex justify-between py-2">
                        <span className="text-lg font-bold text-gray-800">Net Salary</span>
                        <span className="text-2xl font-bold text-indigo-600">{formatCurrency(selectedEmployee.netSalary)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Employee & Payment Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Employee Information</h3>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FiUser className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{selectedEmployee.name}</p>
                            <p className="text-xs text-gray-500">{selectedEmployee.email}</p>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Employee ID:</span>
                          <span className="text-sm font-medium">{selectedEmployee.employeeId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Department:</span>
                          <span className="text-sm font-medium">{selectedEmployee.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Position:</span>
                          <span className="text-sm font-medium">{selectedEmployee.position}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Joining Date:</span>
                          <span className="text-sm font-medium">{selectedEmployee.joinDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Bank Account:</span>
                          <span className="text-sm font-medium">{selectedEmployee.bankName} - {formatAccountNumber(selectedEmployee.accountNumber)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Status</h3>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedEmployee.status === 'Paid' 
                              ? 'bg-green-100 text-green-700' 
                              : selectedEmployee.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {selectedEmployee.status || 'Unpaid'}
                          </span>
                        </div>
                        {selectedEmployee.paymentDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Date:</span>
                            <span className="font-medium">{selectedEmployee.paymentDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      {selectedEmployee.status !== 'Paid' && (
                        <button
                          onClick={() => {
                            handleUpdateStatus(selectedEmployee.id, 'Paid');
                            closeSalaryBreakdown();
                          }}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                        >
                          Process Payment
                        </button>
                      )}
                      <button
                        onClick={() => sendPayslip(selectedEmployee)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
                      >
                        <FiMail size={16} />
                        Send Payslip
                      </button>
                      <button
                        onClick={() => printPayslip(selectedEmployee)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                      >
                        <FiPrinter size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
                    placeholder="Add a note..."
                  ></textarea>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={closeSalaryBreakdown}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                {selectedEmployee.status !== 'Paid' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedEmployee.id, 'Paid');
                      closeSalaryBreakdown();
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;