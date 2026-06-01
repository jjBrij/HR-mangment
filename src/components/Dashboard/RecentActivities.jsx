// src/components/Dashboard/RecentActivities.jsx
import React, { useState, useEffect } from 'react';
import { FiClock, FiUserPlus, FiDollarSign, FiLogIn, FiCalendar } from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const RecentActivities = () => {
  const { employees, leaveRequests, payroll, refreshTrigger } = useAppContext();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadActivities();
  }, [employees, leaveRequests, payroll, refreshTrigger]);

  const loadActivities = () => {
    const newActivities = [];
    
    // Add leave request activities
 leaveRequests.slice(0, 3).forEach(req => {
  newActivities.push({
    id: `leave-${req.id}`,
    title: `${req.employeeName} has applied for leave`,
    date: new Date(req.fromDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    description: req.type,
    type: 'leave'
  });
}); 
    // Add payroll activities
    payroll.filter(p => p.status === 'Paid').slice(0, 2).forEach(p => {
      newActivities.push({
        id: `payroll-${p.id}`,
        title: `${p.name}'s payroll is processed`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: `₹${p.netSalary?.toLocaleString()}`,
        type: 'payroll'
      });
    });
    
    // Add new hire activities (employees joined in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHires = employees.filter(emp => {
      const joinDate = new Date(emp.joinDate);
      return joinDate >= thirtyDaysAgo;
    }).slice(0, 2);
    
    recentHires.forEach(emp => {
      newActivities.push({
        id: `hire-${emp.id}`,
        title: `${emp.name} has joined the company`,
        date: new Date(emp.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: emp.position,
        type: 'hire'
      });
    });
    
    // Sort by date (most recent first)
    const sorted = newActivities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    setActivities(sorted);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'leave': return <FiCalendar className="text-orange-500" />;
      case 'attendance': return <FiLogIn className="text-green-500" />;
      case 'payroll': return <FiDollarSign className="text-blue-500" />;
      case 'hire': return <FiUserPlus className="text-purple-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
          <FiClock className="text-gray-400" />
        </div>
        <p className="text-center text-gray-500 py-4">No recent activities</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
        <FiClock className="text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{activity.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{activity.date}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{activity.description}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RecentActivities);