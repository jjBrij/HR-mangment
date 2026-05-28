// src/components/EmployeeModal.jsx
import React from 'react';
import { FiX, FiMail, FiPhone, FiCalendar, FiBriefcase, FiMapPin, FiUser, FiDownload, FiEdit2, FiFile, FiImage } from 'react-icons/fi';

const EmployeeModal = ({ employee, onClose, onEdit }) => {
  if (!employee) return null;

  // Helper to format file name and get icon
  const getFileIcon = (fileName) => {
    if (!fileName) return <FiFile className="text-gray-500" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <FiImage className="text-green-500" />;
    if (ext === 'pdf') return <FiFile className="text-red-500" />;
    return <FiFile className="text-blue-500" />;
  };

  // Helper to display value or default message
  const displayValue = (value, defaultValue = 'Not provided') => {
    return value && value !== '' ? value : defaultValue;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Not provided';
    return `₹${Number(amount).toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {employee.name?.charAt(0)}{employee.name?.split(' ')[1]?.charAt(0) || ''}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{employee.name || 'Unknown'}</h2>
                <p className="text-sm text-gray-500">
                  {employee.position || employee.designation || 'No position'} • {employee.department || 'No department'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(employee)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                title="Edit Employee"
              >
                <FiEdit2 size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
            
            {/* Basic Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                📋 Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Employee ID</label>
                  <p className="mt-1 text-gray-800">{displayValue(employee.employeeId || employee.id)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                  <p className="mt-1 text-gray-800">{displayValue(employee.name)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Email Address</label>
                  <div className="flex items-center gap-2 mt-1">
                    <FiMail className="text-gray-400" />
                    <p className="text-gray-800">{displayValue(employee.email)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Phone Number</label>
                  <div className="flex items-center gap-2 mt-1">
                    <FiPhone className="text-gray-400" />
                    <p className="text-gray-800">{displayValue(employee.phone)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Date of Birth</label>
                  <div className="flex items-center gap-2 mt-1">
                    <FiCalendar className="text-gray-400" />
                    <p className="text-gray-800">{displayValue(employee.dateOfBirth)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Gender</label>
                  <p className="mt-1 text-gray-800">{displayValue(employee.gender)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Blood Group</label>
                  <p className="mt-1 text-gray-800">{displayValue(employee.bloodGroup)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Marital Status</label>
                  <p className="mt-1 text-gray-800">{displayValue(employee.maritalStatus)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Nationality</label>
                  <p className="mt-1 text-gray-800">{displayValue(employee.nationality, 'Indian')}</p>
                </div>
              </div>
            </div>

            {/* Family Information Section */}
            {(employee.fatherName || employee.motherName || employee.spouseName) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  👨‍👩‍👧‍👦 Family Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Father's Name</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.fatherName)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Father's Contact</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.fatherContact)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Mother's Name</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.motherName)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Mother's Contact</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.motherContact)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Spouse Name</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.spouseName)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Spouse Contact</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.spouseContact)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Address Information */}
            {(employee.address || employee.permanentAddress) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  📍 Address Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Current Address</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.address)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Permanent Address</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.permanentAddress)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {employee.emergencyContactName && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  🚨 Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Contact Person</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.emergencyContactName)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Relationship</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.emergencyContactRelation)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Contact Number</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.emergencyContactNumber)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Employment Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                💼 Employment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Department</label>
                  <div className="flex items-center gap-2 mt-1">
                    <FiBriefcase className="text-gray-400" />
                    <p className="text-gray-800">{displayValue(employee.department)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Designation</label>
                  <p className="mt-1 text-gray-800">{displayValue(employee.position || employee.designation)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Work Location</label>
                  <div className="flex items-center gap-2 mt-1">
                    <FiMapPin className="text-gray-400" />
                    <p className="text-gray-800">{displayValue(employee.workLocation)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Employment Type</label>
                  <p className="mt-1 text-gray-800">{displayValue(employee.employmentType, 'Full-time')}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Joining Date</label>
                  <p className="mt-1 text-gray-800">{displayValue(employee.joinDate || employee.joiningDate)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                  <span className={`inline-flex mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                    employee.status === 'Active' ? 'bg-green-100 text-green-700' :
                    employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {displayValue(employee.status, 'Active')}
                  </span>
                </div>
              </div>
            </div>

            {/* Salary Information */}
            {(employee.currentSalary || employee.previousSalary) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  💰 Salary Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Current Salary</label>
                    <p className="mt-1 text-gray-800 font-semibold text-green-600">
                      {formatCurrency(employee.currentSalary)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Previous Salary</label>
                    <p className="mt-1 text-gray-800">{formatCurrency(employee.previousSalary)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Previous Company</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.previousCompany)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Information */}
            {(employee.bankName || employee.accountNumber) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  🏦 Bank Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Bank Name</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.bankName)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Account Number</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.accountNumber)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">IFSC Code</label>
                    <p className="mt-1 text-gray-800">{displayValue(employee.ifscCode)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Section - if any documents exist */}
            {(() => {
              const docFields = ['aadharCard', 'panCard', 'passportPhoto', 'bankPassbook', 'tenthMarksheet', 'twelfthMarksheet', 'graduationMarksheet', 'resume'];
              const hasDocuments = docFields.some(field => employee[field]);
              
              if (hasDocuments) {
                return (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                      📎 Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {docFields.map(field => {
                        if (employee[field]) {
                          return (
                            <div key={field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-3">
                                {getFileIcon(employee[field]?.name)}
                                <div>
                                  <p className="text-sm font-medium text-gray-700 capitalize">
                                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                  </p>
                                  <p className="text-xs text-gray-500">{employee[field]?.name || 'Uploaded file'}</p>
                                </div>
                              </div>
                              {employee[field]?.preview && (
                                <button 
                                  onClick={() => window.open(employee[field]?.preview, '_blank')}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                >
                                  <FiDownload size={16} />
                                </button>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(employee)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <FiEdit2 size={16} />
              Edit Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;