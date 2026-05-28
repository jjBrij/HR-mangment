// src/components/Dashboard/LeaveSummary.jsx
import React from 'react';
import { leaveSummary } from '../../data/dummyData';
import { FiBriefcase, FiHeart, FiUser, FiMoreHorizontal } from 'react-icons/fi';

const LeaveSummary = () => {
  const leaveTypes = [
    { label: 'Annual Leave', value: leaveSummary.annual, icon: FiBriefcase, color: 'bg-blue-100 text-blue-600' },
    { label: 'Sick Leave', value: leaveSummary.sick, icon: FiHeart, color: 'bg-red-100 text-red-600' },
    { label: 'Personal Leave', value: leaveSummary.personal, icon: FiUser, color: 'bg-green-100 text-green-600' },
    { label: 'Other Leave', value: leaveSummary.other, icon: FiMoreHorizontal, color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Summary</h3>
      
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
      
      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-500">Total Leave Days</span>
        <span className="text-xl font-bold text-gray-800">
          {leaveSummary.annual + leaveSummary.sick + leaveSummary.personal + leaveSummary.other}
        </span>
      </div>
    </div>
  );
};

export default React.memo(LeaveSummary);