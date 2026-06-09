// src/pages/Employees.jsx (Fixed - No duplicate declarations)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiEye, FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi';
import EmployeeModal from '../components/EmployeeModal';
import { api } from '../services/api';
import { getCurrentUser } from '../services/authService';
import { useAppContext } from '../context/AppContext';

const Employees = () => {
  const navigate = useNavigate();
  const { refreshData } = useAppContext();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  
  const currentUser = getCurrentUser();
  const isAdminOrHR = currentUser?.role === 'admin' || currentUser?.role === 'hr_manager';

  // Load employees from API
  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/employees/');
      console.log('Employees loaded:', response);
      
      let employeesList = [];
      if (Array.isArray(response)) {
        employeesList = response;
      } else if (response.results && Array.isArray(response.results)) {
        employeesList = response.results;
      } else if (response.data && Array.isArray(response.data)) {
        employeesList = response.data;
      }
      
      setEmployees(employeesList);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError(err.message || 'Failed to load employees. Please try again.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Navigate to Add Employee page
  const handleAddEmployee = () => {
    navigate('/employees/add');
  };

  // View employee details
  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  // Edit employee - SINGLE DECLARATION (remove duplicate)
  const handleEdit = (employee) => {
  // Store employee data and navigate to edit page
  navigate(`/employees/edit/${employee.id}`, { state: { employee } });
};

  // Delete employee
  const handleDelete = async (id, employeeName) => {
    if (window.confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      setDeleting(true);
      try {
        await api.delete(`/api/employees/${id}/`);
        alert('Employee deleted successfully!');
        refreshData();
        loadEmployees();
      } catch (err) {
        console.error('Error deleting employee:', err);
        const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to delete employee';
        alert(errorMsg);
      } finally {
        setDeleting(false);
      }
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusMap = {
      'Active': 'bg-green-100 text-green-700',
      'On Leave': 'bg-yellow-100 text-yellow-700',
      'Resigned': 'bg-red-100 text-red-700',
      'Terminated': 'bg-red-100 text-red-700',
      'Inactive': 'bg-gray-100 text-gray-700'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">⚠️ {error}</div>
        <button
          onClick={loadEmployees}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-500 mt-1">Manage your workforce</p>
        </div>
        {isAdminOrHR && (
          <button
            onClick={handleAddEmployee}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md"
          >
            <FiUserPlus size={18} />
            Add Employee
          </button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, department, position, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
          <FiFilter size={16} />
          Filter
        </button>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Employee ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Position</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Join Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                {isAdminOrHR && (
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-600">{employee.employee_id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {employee.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{employee.name}</p>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{employee.department || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{employee.position || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{employee.joining_date || employee.joinDate || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(employee.status)}`}>
                        {employee.status || 'Active'}
                      </span>
                    </td>
                    {isAdminOrHR && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(employee)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(employee)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(employee.id, employee.name)}
                            disabled={deleting}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdminOrHR ? 7 : 6} className="text-center py-12">
                    <div className="text-center">
                      <p className="text-gray-500">No employees found</p>
                      {searchTerm && (
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
                      )}
                      {isAdminOrHR && !searchTerm && (
                        <button
                          onClick={handleAddEmployee}
                          className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Add your first employee →
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Employee Count */}
        {filteredEmployees.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-500">
            Showing {filteredEmployees.length} of {employees.length} employees
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      {showModal && selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={closeModal}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default Employees;