// src/pages/Employees.jsx (Updated with Modal and Edit)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiEye, FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi';
import EmployeeModal from '../components/EmployeeModal';
import { simulateApiCall } from '../data/dummyData';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Load employees from localStorage or use dummy data
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees && JSON.parse(storedEmployees).length > 0) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      // Default dummy employees with complete data
      const defaultEmployees = [
        { 
          
          
        }
        
        
      ];
      setEmployees(defaultEmployees);
      localStorage.setItem('employees', JSON.stringify(defaultEmployees));
    }
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Edit employee - navigate to edit page with employee data
  const handleEdit = (employee) => {
    // Store employee data in sessionStorage for edit page
    sessionStorage.setItem('editEmployee', JSON.stringify(employee));
    navigate('/employees/edit', { state: { employee } });
  };

  // Delete employee
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setLoading(true);
      await simulateApiCall();
      const updatedEmployees = employees.filter(emp => emp.id !== id);
      setEmployees(updatedEmployees);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      setLoading(false);
      alert('Employee deleted successfully!');
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-500 mt-1">Manage your workforce</p>
        </div>
        <button
          onClick={handleAddEmployee}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md"
        >
          <FiUserPlus size={18} />
          Add Employee
        </button>
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
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-600">{employee.employeeId || `EMP${String(employee.id).padStart(3, '0')}`}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {employee.avatar || employee.name?.charAt(0) + (employee.name?.split(' ')[1]?.charAt(0) || '')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{employee.department}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{employee.position || employee.designation}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{employee.joinDate || employee.joiningDate}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      employee.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
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
                        onClick={() => handleDelete(employee.id)}
                        disabled={loading}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
        
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No employees found</p>
            <button
              onClick={handleAddEmployee}
              className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Add your first employee →
            </button>
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      {showModal && (
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