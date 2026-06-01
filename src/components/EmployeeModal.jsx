

// employee view page apper after clicking on employee view button in employee list page. 
// It will show all the details of employee in a modal.


import React, { useState } from 'react';
import { FiX, FiMail, FiPhone, FiCalendar, FiBriefcase,
          FiMapPin, FiUser, FiDownload, FiEdit2, FiFile, 
          FiImage } from 'react-icons/fi';

const EmployeeModal = ({ employee, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('basic');

  if (!employee) return null;

  // Helper to format file name
  const getFileIcon = (fileName) => {
    if (!fileName) return <FiFile />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext)) return <FiImage />;
    return <FiFile />;
  };

  // Render document section
  const renderDocuments = () => {
    const documents = [
      { label: 'Aadhar Card', field: 'aadharCard' },
      { label: 'PAN Card', field: 'panCard' },
      { label: 'Passport Photo', field: 'passportPhoto' },
      { label: 'Bank Passbook', field: 'bankPassbook' },
      { label: '10th Marksheet', field: 'tenthMarksheet' },
      { label: '12th Marksheet', field: 'twelfthMarksheet' },
      { label: 'Graduation Marksheet', field: 'graduationMarksheet' },
      { label: 'Post Graduation Marksheet', field: 'postGraduationMarksheet' },
      { label: 'Previous Experience Certificate', field: 'previousExperienceCertificate' },
      { label: 'Current Experience Letter', field: 'currentExperienceLetter' },
      { label: 'Previous Salary Slip', field: 'previousSalarySlip' },
      { label: 'Offer Letter', field: 'offerLetter' },
      { label: 'Appointment Letter', field: 'appointmentLetter' },
      { label: 'Resume', field: 'resume' },
    ];

    const uploadedDocs = documents.filter(doc => employee[doc.field]);
    
    if (uploadedDocs.length === 0) {
      return <p className="text-gray-500 text-center py-8">No documents uploaded</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {uploadedDocs.map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                {getFileIcon(employee[doc.field]?.name)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{doc.label}</p>
                <p className="text-xs text-gray-500">{employee[doc.field]?.name || 'Uploaded file'}</p>
              </div>
            </div>
            <button 
              onClick={() => window.open(employee[doc.field]?.preview, '_blank')}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            >
              <FiDownload size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {employee.name?.charAt(0)}{employee.name?.split(' ')[1]?.charAt(0) || ''}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{employee.name}</h2>
                <p className="text-sm text-gray-500">{employee.position} • {employee.department}</p>
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

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-6 overflow-x-auto">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'family', label: 'Family' },
                { id: 'employment', label: 'Employment' },
                { id: 'bank', label: 'Bank Details' },
                { id: 'documents', label: 'Documents' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 transition font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem icon={FiUser} label="Employee ID" value={employee.employeeId || employee.id} />
                  <InfoItem icon={FiCalendar} label="Date of Birth" value={employee.dateOfBirth || 'Not provided'} />
                  <InfoItem icon={FiUser} label="Gender" value={employee.gender || 'Not specified'} />
                  <InfoItem icon={FiUser} label="Blood Group" value={employee.bloodGroup || 'Not specified'} />
                  <InfoItem icon={FiUser} label="Marital Status" value={employee.maritalStatus || 'Not specified'} />
                  <InfoItem icon={FiUser} label="Nationality" value={employee.nationality || 'Indian'} />
                  <InfoItem icon={FiMail} label="Email" value={employee.email} />
                  <InfoItem icon={FiPhone} label="Phone" value={employee.phone} />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Address Information</h4>
                  <div className="space-y-3">
                    <InfoItem label="Current Address" value={employee.address || 'Not provided'} fullWidth />
                    <InfoItem label="Permanent Address" value={employee.permanentAddress || 'Not provided'} fullWidth />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Contact Person" value={employee.emergencyContactName || 'Not provided'} />
                    <InfoItem label="Relationship" value={employee.emergencyContactRelation || 'Not provided'} />
                    <InfoItem label="Contact Number" value={employee.emergencyContactNumber || 'Not provided'} />
                  </div>
                </div>
              </div>
            )}

            {/* Family Information Tab */}
            {activeTab === 'family' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Father's Name" value={employee.fatherName || 'Not provided'} />
                  <InfoItem label="Father's Contact" value={employee.fatherContact || 'Not provided'} />
                  <InfoItem label="Mother's Name" value={employee.motherName || 'Not provided'} />
                  <InfoItem label="Mother's Contact" value={employee.motherContact || 'Not provided'} />
                  <InfoItem label="Spouse Name" value={employee.spouseName || 'Not provided'} />
                  <InfoItem label="Spouse Contact" value={employee.spouseContact || 'Not provided'} />
                </div>
              </div>
            )}

            {/* Employment Information Tab */}
            {activeTab === 'employment' && (
              <div className="space-y-6">
                <h4 className="font-semibold text-gray-800 mb-3">Current Employment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem icon={FiBriefcase} label="Department" value={employee.department} />
                  <InfoItem icon={FiBriefcase} label="Designation" value={employee.position || employee.designation} />
                  <InfoItem icon={FiMapPin} label="Work Location" value={employee.workLocation || 'Not specified'} />
                  <InfoItem label="Employment Type" value={employee.employmentType || 'Full-time'} />
                  <InfoItem label="Joining Date" value={employee.joinDate || employee.joiningDate || 'Not specified'} />
                  <InfoItem label="Current Salary" value={employee.currentSalary ? `₹${Number(employee.currentSalary).toLocaleString()}` : 'Not specified'} />
                  <InfoItem label="Status" value={employee.status}>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      employee.status === 'Active' ? 'bg-green-100 text-green-700' :
                      employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {employee.status}
                    </span>
                  </InfoItem>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Previous Employment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Previous Company" value={employee.previousCompany || 'Not provided'} />
                    <InfoItem label="Previous Salary" value={employee.previousSalary ? `₹${Number(employee.previousSalary).toLocaleString()}` : 'Not provided'} />
                  </div>
                </div>
              </div>
            )}

            {/* Bank Information Tab */}
            {activeTab === 'bank' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Bank Name" value={employee.bankName || 'Not provided'} />
                  <InfoItem label="Account Number" value={employee.accountNumber || 'Not provided'} />
                  <InfoItem label="IFSC Code" value={employee.ifscCode || 'Not provided'} />
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && renderDocuments()}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(employee)}
              className="ml-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Edit Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for info items
const InfoItem = ({ icon: Icon, label, value, fullWidth, children }) => (
  <div className={fullWidth ? 'col-span-full' : ''}>
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
    {children ? (
      children
    ) : (
      <p className="mt-1 text-gray-800">{value || '—'}</p>
    )}
  </div>
);

export default EmployeeModal;   