// src/components/Dashboard/EmployeeOverview.jsx
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const EmployeeOverview = () => {
  const { employees, refreshTrigger } = useAppContext();
  const [overview, setOverview] = useState({
    newHires: 0,
    departures: 0,
    transfers: 0,
    promotions: 0,
    percentages: {}
  });

  useEffect(() => {
    calculateOverview();
  }, [employees, refreshTrigger]);

  const calculateOverview = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate new hires this month
    const newHires = employees.filter(emp => {
      const joinDate = new Date(emp.joinDate);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;
    
    // Calculate departures
    const departures = employees.filter(emp => 
      emp.status === 'Resigned' || emp.status === 'Terminated'
    ).length;
    
    // Calculate promotions (employees with Senior/Lead in title)
    const promotions = employees.filter(emp => 
      emp.position?.includes('Senior') || emp.position?.includes('Lead') || emp.position?.includes('Manager')
    ).length;
    
    // Transfers (simplified - can be enhanced with actual transfer tracking)
    const transfers = 0;
    
    setOverview({
      newHires: newHires,
      departures: departures,
      transfers: transfers,
      promotions: promotions,
      percentages: {
        newHires: employees.length > 0 ? `+${Math.round((newHires / employees.length) * 100)}%` : '+0%',
        departures: employees.length > 0 ? `-${Math.round((departures / employees.length) * 100)}%` : '-0%',
        transfers: '+0%',
        promotions: employees.length > 0 ? `+${Math.round((promotions / employees.length) * 100)}%` : '+0%'
      }
    });
  };

  const metrics = [
    { label: 'New Hires', value: overview.newHires, change: overview.percentages?.newHires || '+0%', trend: 'up' },
    { label: 'Departures', value: overview.departures, change: overview.percentages?.departures || '-0%', trend: 'down' },
    { label: 'Transfers', value: overview.transfers, change: overview.percentages?.transfers || '+0%', trend: 'up' },
    { label: 'Promotions', value: overview.promotions, change: overview.percentages?.promotions || '+0%', trend: 'up' },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Employee Overview</h3>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-indigo-400">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Quarter</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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