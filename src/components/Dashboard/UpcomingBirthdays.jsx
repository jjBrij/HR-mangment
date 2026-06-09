// src/components/Dashboard/UpcomingBirthdays.jsx
import React from 'react';
import { FiGift } from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const UpcomingBirthdays = () => {
  const { getUpcomingBirthdays } = useAppContext();
  const birthdays = getUpcomingBirthdays();

  if (birthdays.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FiGift className="text-indigo-500 text-xl" />
          <h3 className="text-lg font-semibold text-gray-800">Upcoming Birthdays</h3>
        </div>
        <p className="text-center text-gray-500 py-4">No upcoming birthdays in the next 30 days</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <FiGift className="text-indigo-500 text-xl" />
        <h3 className="text-lg font-semibold text-gray-800">Upcoming Birthdays</h3>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-3 text-xs font-semibold text-gray-500 pb-2 border-b border-gray-100">
          <span>EMPLOYEE</span>
          <span>DEPARTMENT</span>
          <span>BIRTHDAY</span>
        </div>
        
        {birthdays.map((birthday) => (
          <div key={birthday.id} className="grid grid-cols-3 items-center py-2 hover:bg-gray-50 rounded-lg transition px-2">
            <span className="font-medium text-gray-800 text-sm">{birthday.name}</span>
            <span className="text-sm text-gray-600">{birthday.department}</span>
            <span className="text-sm text-indigo-600 font-medium">
              {new Date(birthday.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(UpcomingBirthdays);