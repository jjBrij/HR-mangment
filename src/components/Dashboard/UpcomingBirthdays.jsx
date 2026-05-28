// src/components/Dashboard/UpcomingBirthdays.jsx
import React from 'react';
import { upcomingBirthdays } from '../../data/dummyData';
import { FiGift } from 'react-icons/fi';

const UpcomingBirthdays = () => {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <FiGift className="text-indigo-500 text-xl" />
        <h3 className="text-lg font-semibold text-gray-800">Upcoming Birthdays</h3>
      </div>
      
      <div className="space-y-3">
        {/* Table Header */}
        <div className="grid grid-cols-3 text-xs font-semibold text-gray-500 pb-2 border-b border-gray-100">
          <span>EMPLOYEE</span>
          <span>DEPARTMENT</span>
          <span>BIRTHDAY</span>
        </div>
        
        {/* Birthday List */}
        {upcomingBirthdays.map((birthday, idx) => (
          <div key={birthday.id} className="grid grid-cols-3 items-center py-2 hover:bg-gray-50 rounded-lg transition px-2">
            <span className="font-medium text-gray-800 text-sm">{birthday.name}</span>
            <span className="text-sm text-gray-600">{birthday.department}</span>
            <span className="text-sm text-indigo-600 font-medium">{birthday.date}</span>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2 hover:bg-indigo-50 rounded-lg transition">
        View All Birthdays →
      </button>
    </div>
  );
};

export default React.memo(UpcomingBirthdays);