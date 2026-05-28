// src/components/Dashboard/EmployeeOverview.jsx
import React from 'react';
import { employeeOverview } from '../../data/dummyData';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

const EmployeeOverview = () => {
  const metrics = [
    { label: 'New Hires', value: employeeOverview.newHires, change: employeeOverview.percentages.newHires, trend: 'up' },
    { label: 'Departures', value: employeeOverview.departures, change: employeeOverview.percentages.departures, trend: 'down' },
    { label: 'Transfers', value: employeeOverview.transfers, change: employeeOverview.percentages.transfers, trend: 'up' },
    { label: 'Promotions', value: employeeOverview.promotions, change: employeeOverview.percentages.promotions, trend: 'up' },
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

      {/* Chart Bars - Visual representation */}
      <div className="flex items-end justify-between gap-2 mb-6 h-32">
        {employeeOverview.chartData.map((value, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-lg transition-all duration-500 hover:from-indigo-600"
              style={{ height: `${Math.min(value / 3, 100)}px` }}
            ></div>
            <span className="text-xs text-gray-500">{value}</span>
          </div>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">{metric.label}</p>
            <p className="text-xl font-bold text-gray-800">{metric.value}</p>
            <span className={`inline-flex items-center gap-0.5 text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metric.trend === 'up' ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
              {metric.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(EmployeeOverview);