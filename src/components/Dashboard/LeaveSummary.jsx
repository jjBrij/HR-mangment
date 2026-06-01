// src/components/Dashboard/LeaveSummary.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { FiBriefcase, FiHeart, FiUser, FiMoreHorizontal, FiCalendar, FiClock } from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const LeaveSummary = () => {
  const { leaveRequests, refreshTrigger, user } = useAppContext();
  const [loading, setLoading] = useState(true);

  // Calculate leave summary with useMemo for performance
  const leaveSummary = useMemo(() => {
    // Get current date for checking ongoing leaves
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Initialize counters
    let annual = 0;
    let sick = 0;
    let personal = 0;
    let other = 0;
    let currentOnLeave = 0;
    
    // Process each leave request
    leaveRequests.forEach(leave => {
      // Only count approved leaves
      if (leave.status === 'Approved') {
        // Calculate days if not provided
        let days = leave.days;
        if (!days && leave.fromDate && leave.toDate) {
          const start = new Date(leave.fromDate);
          const end = new Date(leave.toDate);
          const diffTime = Math.abs(end - start);
          days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
        
        // Add to leave type counters
        switch(leave.type) {
          case 'Annual Leave':
            annual += days || 0;
            break;
          case 'Sick Leave':
            sick += days || 0;
            break;
          case 'Personal Leave':
            personal += days || 0;
            break;
          default:
            other += days || 0;
        }
        
        // Check if employee is currently on leave
        const startDate = new Date(leave.fromDate);
        const endDate = new Date(leave.toDate);
        endDate.setHours(23, 59, 59);
        
        if (today >= startDate && today <= endDate) {
          currentOnLeave++;
        }
      }
    });
    
    const totalActiveLeaves = annual + sick + personal + other;
    
    return {
      annual,
      sick,
      personal,
      other,
      totalActiveLeaves,
      currentOnLeave
    };
  }, [leaveRequests]);

  // Get max allowed leave days (could come from user settings or context)
  const maxLeaveDays = user?.maxAnnualLeaveDays || 100;
  
  // Calculate usage percentage
  const usagePercentage = Math.min((leaveSummary.totalActiveLeaves / maxLeaveDays) * 100, 100);

  useEffect(() => {
    setLoading(false);
  }, []);

  const leaveTypes = [
    { label: 'Annual Leave', value: leaveSummary.annual, icon: FiBriefcase, color: 'bg-blue-100 text-blue-600', key: 'annual' },
    { label: 'Sick Leave', value: leaveSummary.sick, icon: FiHeart, color: 'bg-red-100 text-red-600', key: 'sick' },
    { label: 'Personal Leave', value: leaveSummary.personal, icon: FiUser, color: 'bg-green-100 text-green-600', key: 'personal' },
    { label: 'Other Leave', value: leaveSummary.other, icon: FiMoreHorizontal, color: 'bg-gray-100 text-gray-600', key: 'other' },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Summary</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-2 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state if no leaves
  if (leaveSummary.totalActiveLeaves === 0 && leaveRequests.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Summary</h3>
        <div className="text-center py-6">
          <FiCalendar className="mx-auto text-gray-400 text-4xl mb-3" />
          <p className="text-gray-500">No leave records found</p>
          <p className="text-xs text-gray-400 mt-1">Approved leaves will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Leave Summary</h3>
        {leaveSummary.currentOnLeave > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
            <FiClock className="text-orange-500 text-xs" />
            <span className="text-xs font-medium text-orange-600">
              {leaveSummary.currentOnLeave} on leave now
            </span>
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
      
      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-500">Total Leave Days (Approved)</span>
        <span className="text-xl font-bold text-indigo-600">{leaveSummary.totalActiveLeaves}</span>
      </div>
      
      {/* Progress bar for leave usage */}
      {leaveSummary.totalActiveLeaves > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Used</span>
            <span>{usagePercentage.toFixed(0)}% of {maxLeaveDays} days</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(LeaveSummary);