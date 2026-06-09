// src/components/Dashboard/EmployeeOverview.jsx
import React from 'react';
import { useAppContext } from '../../context/AppContext';

const EmployeeOverview = () => {
  const { employees } = useAppContext();
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const newHires = employees.filter(emp => {
    const joinDate = new Date(emp.joining_date);
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
  }).length;
  
  const departures = employees.filter(emp => 
    emp.status === 'Resigned' || emp.status === 'Terminated'
  ).length;
  
  const promotions = employees.filter(emp => 
    emp.position?.includes('Senior') || emp.position?.includes('Lead') || emp.position?.includes('Manager')
  ).length;
  
  const total = employees.length || 1;

  const metrics = [
    { label: 'New Hires', value: newHires, change: `+${Math.round((newHires / total) * 100)}%`, trend: 'up' },
    { label: 'Departures', value: departures, change: `-${Math.round((departures / total) * 100)}%`, trend: 'down' },
    { label: 'Promotions', value: promotions, change: `+${Math.round((promotions / total) * 100)}%`, trend: 'up' },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Employee Overview</h3>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
          <option>This Month</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">{metric.label}</p>
            <p className="text-xl font-bold text-gray-800">{metric.value}</p>
            <span className={`inline-flex items-center gap-0.5 text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metric.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(EmployeeOverview);