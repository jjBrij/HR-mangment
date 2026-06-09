// src/components/Dashboard/LeaveSummary.jsx
import React from 'react';
import { FiBriefcase, FiHeart, FiUser, FiMoreHorizontal, FiCalendar, FiClock } from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const LeaveSummary = () => {
  const { leaveRequests } = useAppContext();
  
  // Calculate leave summary
  let annual = 0, sick = 0, personal = 0, other = 0;
  let currentOnLeave = 0;
  const today = new Date().toISOString().split('T')[0];
  
  leaveRequests.forEach(leave => {
    if (leave.status === 'Approved') {
      switch(leave.leave_type) {
        case 'Annual Leave': annual += leave.days || 0; break;
        case 'Sick Leave': sick += leave.days || 0; break;
        case 'Personal Leave': personal += leave.days || 0; break;
        default: other += leave.days || 0;
      }
      
      if (leave.from_date <= today && leave.to_date >= today) {
        currentOnLeave++;
      }
    }
  });
  
  const totalLeaves = annual + sick + personal + other;
  
  const leaveTypes = [
    { label: 'Annual Leave', value: annual, icon: FiBriefcase, color: 'bg-blue-100 text-blue-600' },
    { label: 'Sick Leave', value: sick, icon: FiHeart, color: 'bg-red-100 text-red-600' },
    { label: 'Personal Leave', value: personal, icon: FiUser, color: 'bg-green-100 text-green-600' },
    { label: 'Other Leave', value: other, icon: FiMoreHorizontal, color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Leave Summary</h3>
        {currentOnLeave > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
            <FiClock className="text-orange-500 text-xs" />
            <span className="text-xs font-medium text-orange-600">{currentOnLeave} on leave now</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {leaveTypes.map((type, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${type.color} rounded-lg flex items-center justify-center`}>
                <type.icon className="text-sm" />
              </div>
              <span className="text-sm text-gray-700">{type.label}</span>
            </div>
            <span className="text-lg font-semibold text-gray-800">{type.value}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-500">Total Leave Days (Approved)</span>
        <span className="text-xl font-bold text-indigo-600">{totalLeaves}</span>
      </div>
    </div>
  );
};

export default React.memo(LeaveSummary);