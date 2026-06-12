// src/pages/EmployeeDetail.jsx (or wherever you view employee details)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { EmployeeDocuments } from '../components/EmployeeDocuments';
import { api } from '../services/api';

const EmployeeDetail = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await api.get(`/api/employees/${id}/`);
      setEmployee(response.data);
    } catch (error) {
      console.error('Error fetching employee:', error);
    }
  };

  const tabs = [
    { id: 'info', label: 'Information' },
    { id: 'documents', label: 'Documents' },
    { id: 'salary', label: 'Salary' },
    { id: 'attendance', label: 'Attendance' },
  ];

  if (!employee) return <div>Loading...</div>;

  return (
    <div className="employee-detail-page">
      <div className="border-b">
        <div className="flex gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'info' && (
          // Your existing employee info display
          <div>Employee Information...</div>
        )}
        
        {activeTab === 'documents' && (
          <EmployeeDocuments employeeId={id} employeeData={employee} />
        )}
      </div>
    </div>
  );
};

export default EmployeeDetail;