// src/pages/Payroll.jsx
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
  FiEdit2
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

  // Initialize and sync payroll data with employees
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load employees from localStorage
    const storedEmployees = localStorage.getItem('employees');
    let employeeList = [];
    
    if (storedEmployees && JSON.parse(storedEmployees).length > 0) {
      employeeList = JSON.parse(storedEmployees);
    } else {
      // Default employees
      employeeList = [
        {
          id: 1,
          employeeId: 'EMP001',
          name: 'John Smith',
          email: 'john.smith@demo.com',
          department: 'Engineering',
          position: 'Senior Developer',
          joinDate: '2022-01-15',
          status: 'Active',
          phone: '+1 234 567 8900',
          basicSalary: 8000,
          bankName: 'Chase Bank',
          accountNumber: '1234567890',
          ifscCode: 'CHAS0123456'
        },
        {
          id: 2,
          employeeId: 'EMP002',
          name: 'Sarah Johnson',
          email: 'sarah.j@demo.com',
          department: 'Marketing',
          position: 'Marketing Manager',
          joinDate: '2021-08-20',
          status: 'Active',
          phone: '+1 234 567 8901',
          basicSalary: 6500,
          bankName: 'Bank of America',
          accountNumber: '9876543210',
          ifscCode: 'BOFA0123456'
        },
        {
          id: 3,
          employeeId: 'EMP003',
          name: 'Michael Chen',
          email: 'michael.chen@demo.com',
          department: 'Sales',
          position: 'Sales Representative',
          joinDate: '2023-02-10',
          status: 'Active',
          phone: '+1 234 567 8902',
          basicSalary: 5500,
          bankName: 'Wells Fargo',
          accountNumber: '5555555555',
          ifscCode: 'WFIB0123456'
        }
      ];
      localStorage.setItem('employees', JSON.stringify(employeeList));
    }
    
    setEmployees(employeeList);
    
    // Load payroll data or create from employees
    const storedPayroll = localStorage.getItem('payrollData');
    if (storedPayroll && JSON.parse(storedPayroll).length > 0) {
      const parsedPayroll = JSON.parse(storedPayroll);
      // Sync with latest employee data
      const syncedPayroll = employeeList.map(emp => {
        const existingPayroll = parsedPayroll.find(p => p.employeeId === emp.employeeId);
        if (existingPayroll) {
          return {
            ...existingPayroll,
            name: emp.name,
            email: emp.email,
            department: emp.department,
            position: emp.position,
            joinDate: emp.joinDate,
            bankName: emp.bankName,
            accountNumber: emp.accountNumber,
            basicSalary: emp.basicSalary || existingPayroll.basicSalary
          };
        }
        return {
          id: emp.id,
          employeeId: emp.employeeId,
          name: emp.name,
          email: emp.email,
          department: emp.department,
          position: emp.position,
          basicSalary: emp.basicSalary || 5000,
          allowance: 1000,
          bonus: 0,
          deductions: 500,
          providentFund: 500,
          professionalTax: 200,
          incomeTax: 200,
          netSalary: emp.basicSalary ? emp.basicSalary + 1000 - 500 : 5500,
          status: 'Unpaid',
          paymentDate: null,
          joinDate: emp.joinDate,
          bankName: emp.bankName,
          accountNumber: emp.accountNumber,
          ifscCode: emp.ifscCode
        };
      });
      setPayrollData(syncedPayroll);
      localStorage.setItem('payrollData', JSON.stringify(syncedPayroll));
    } else {
      // Create default payroll data from employees
      const defaultPayroll = employeeList.map(emp => ({
        id: emp.id,
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        position: emp.position,
        basicSalary: emp.basicSalary || 5000,
        allowance: 1000,
        bonus: 0,
        deductions: 500,
        providentFund: 500,
        professionalTax: 200,
        incomeTax: 200,
        netSalary: (emp.basicSalary || 5000) + 1000 - 500,
        status: 'Unpaid',
        paymentDate: null,
        joinDate: emp.joinDate,
        bankName: emp.bankName,
        accountNumber: emp.accountNumber,
        ifscCode: emp.ifscCode
      }));
      setPayrollData(defaultPayroll);
      localStorage.setItem('payrollData', JSON.stringify(defaultPayroll));
    }
  };

  // Calculate summary statistics
  const totalPayroll = payrollData.reduce((sum, emp) => sum + emp.netSalary, 0);
  const paidEmployees = payrollData.filter(emp => emp.status === 'Paid').length;
  const unpaidEmployees = payrollData.filter(emp => emp.status === 'Unpaid' || emp.status === 'Pending').length;
  const pendingAmount = payrollData
    .filter(emp => emp.status !== 'Paid')
    .reduce((sum, emp) => sum + emp.netSalary, 0);

  // Filter employees based on search and status
  const filteredEmployees = payrollData.filter(emp => {
    const matchesSearch = 
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || emp.status?.toLowerCase() === filterStatus.toLowerCase();
    
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
      bonus: employee.bonus,
      deductions: employee.deductions,
      status: employee.status
    });
  };

  // Handle edit input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: name === 'bonus' || name === 'deductions' ? parseFloat(value) || 0 : value }));
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
          netSalary: emp.basicSalary + emp.allowance + editFormData.bonus - editFormData.deductions
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
        ? { ...emp, status: newStatus, paymentDate: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : null }
        : emp
    );
    
    setPayrollData(updatedPayroll);
    localStorage.setItem('payrollData', JSON.stringify(updatedPayroll));
    setLoading(false);
    alert(`Payment ${newStatus === 'Paid' ? 'processed' : 'updated'} successfully!`);
  };

  // Handle bulk action
  const handleBulkAction = async (action) => {
    if (action === 'payAll') {
      if (window.confirm('Process all pending payments?')) {
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
        alert('All pending payments processed successfully!');
      }
    } else if (action === 'export') {
      exportToCSV();
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Basic Salary', 'Bonus', 'Deductions', 'Net Salary', 'Status', 'Payment Date'];
    const csvData = payrollData.map(emp => [
      emp.employeeId,
      emp.name,
      emp.email,
      emp.department,
      emp.basicSalary,
      emp.bonus,
      emp.deductions,
      emp.netSalary,
      emp.status,
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
            <tr><th>Description</th><th>Amount (USD)</th></tr>
            <tr><td>Basic Salary</td><td>$${employee.basicSalary.toFixed(2)}</td></tr>
            <tr><td>Allowance</td><td>+$${employee.allowance.toFixed(2)}</td></tr>
            <tr><td>Bonus</td><td>+$${employee.bonus.toFixed(2)}</td></tr>
            <tr><td>Provident Fund</td><td>-$${employee.providentFund.toFixed(2)}</td></tr>
            <tr><td>Professional Tax</td><td>-$${employee.professionalTax.toFixed(2)}</td></tr>
            <tr><td>Income Tax</td><td>-$${employee.incomeTax.toFixed(2)}</td></tr>
            <tr class="total"><td>Net Salary</td><td>$${employee.netSalary.toFixed(2)}</td></tr>
          </table>
          <p style="margin-top: 30px; text-align: center;">This is a computer-generated document. No signature required.</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Format account number to show full number
  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return 'Not provided';
    return accountNumber;
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Payroll Management</h1>
        <p className="text-gray-500 mt-1">Manage and process employee payroll efficiently</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Payroll</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">${totalPayroll.toLocaleString()}</p>
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
              <p className="text-xs text-green-600 mt-2">{Math.round((paidEmployees / payrollData.length) * 100)}% of total employees</p>
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
              <p className="text-xs text-orange-600 mt-2">${pendingAmount.toLocaleString()} pending</p>
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
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <FiDollarSign size={16} />
            Process All Unpaid
          </button>
          <button
            onClick={() => handleBulkAction('export')}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm flex items-center gap-2"
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
              placeholder="Search by name, ID, department, email..."
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
                    <span className="text-sm text-gray-700">${employee.basicSalary?.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingRow === employee.id ? (
                      <input
                        type="number"
                        name="bonus"
                        value={editFormData.bonus}
                        onChange={handleEditChange}
                        className="w-24 px-2 py-1 text-right border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                      />
                    ) : (
                      <span className="text-sm text-green-600">+${employee.bonus?.toLocaleString()}</span>
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
                      />
                    ) : (
                      <span className="text-sm text-red-600">-${employee.deductions?.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-800">${employee.netSalary?.toLocaleString()}</span>
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
                            title="Edit"
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
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-1 rounded-lg transition ${
                  currentPage === index + 1
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

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
                          <span className="font-semibold text-gray-800">${selectedEmployee.basicSalary?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Allowance</span>
                          <span className="text-green-600">+${selectedEmployee.allowance?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Bonus</span>
                          <span className="text-green-600">+${selectedEmployee.bonus?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Provident Fund</span>
                          <span className="text-red-600">-${selectedEmployee.providentFund?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Professional Tax</span>
                          <span className="text-red-600">-${selectedEmployee.professionalTax?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Income Tax</span>
                          <span className="text-red-600">-${selectedEmployee.incomeTax?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t-2 border-gray-200">
                      <div className="flex justify-between py-2">
                        <span className="text-lg font-bold text-gray-800">Net Salary</span>
                        <span className="text-2xl font-bold text-indigo-600">${selectedEmployee.netSalary?.toLocaleString()}</span>
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