// src/components/Dashboard/UpcomingBirthdays.jsx
import React, { useState, useEffect } from 'react';
import { FiGift } from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const UpcomingBirthdays = () => {
  const { employees, refreshTrigger } = useAppContext();
  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    loadBirthdays();
  }, [employees, refreshTrigger]);

  const loadBirthdays = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    
    const upcoming = employees.filter(emp => {
      if (!emp.dateOfBirth) return false;
      const birthDate = new Date(emp.dateOfBirth);
      const birthMonth = birthDate.getMonth();
      const birthDay = birthDate.getDate();
      
      // Check if birthday is in next 30 days
      if (birthMonth === currentMonth && birthDay >= currentDay) return true;
      if (birthMonth === currentMonth + 1 && birthDay <= currentDay + 30) return true;
      return false;
    }).slice(0, 3).map(emp => ({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      date: `${new Date(emp.dateOfBirth).toLocaleString('default', { month: 'short' })} ${new Date(emp.dateOfBirth).getDate()}`
    }));
    
    setBirthdays(upcoming);
  };

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
            <span className="text-sm text-indigo-600 font-medium">{birthday.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(UpcomingBirthdays);