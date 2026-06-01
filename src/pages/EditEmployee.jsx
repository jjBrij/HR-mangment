// src/pages/EditEmployee.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiSave, 
  FiX, 
  FiUpload, 
  FiFile, 
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiHome,
  FiUsers,
  FiHeart,
  FiAlertCircle
} from 'react-icons/fi';

const EditEmployee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    // Basic Information
    id: '',
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: '',
    maritalStatus: 'Single',
    nationality: 'Indian',
    
    // Family Information
    fatherName: '',
    fatherContact: '',
    motherName: '',
    motherContact: '',
    spouseName: '',
    spouseContact: '',
    
    // Address Information
    address: '',
    permanentAddress: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactNumber: '',
    
    // Job Information
    department: 'Engineering',
    position: '',
    designation: '',
    workLocation: '',
    employmentType: 'Full-time',
    joiningDate: '',
    status: 'Active',
    
    // Salary Information
    basicSalary: '',
    currentSalary: '',
    previousCompany: '',
    previousSalary: '',
    
    // Bank Information
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    bankPassbook: null,
    
    // Documents
    aadharCard: null,
    panCard: null,
    passportPhoto: null,
    tenthMarksheet: null,
    twelfthMarksheet: null,
    graduationMarksheet: null,
    resume: null
  });

  const [uploadedFiles, setUploadedFiles] = useState({});
  const [errors, setErrors] = useState({});

 useEffect(() => {
  const employeeData =
    location.state?.employee ||
    JSON.parse(sessionStorage.getItem('editEmployee'));

  if (employeeData) {
    setFormData(prev => ({
      ...prev,  
      ...employeeData,
      position: employeeData.position || employeeData.designation || '',
      basicSalary:
        employeeData.basicSalary || employeeData.currentSalary || '',
      currentSalary:
        employeeData.currentSalary || employeeData.basicSalary || '',
    }));

    const files = {};
    const fileFields = [
      'aadharCard',
      'panCard',
      'passportPhoto',
      'bankPassbook',
      'tenthMarksheet',
      'twelfthMarksheet',
      'graduationMarksheet',
      'resume',
    ];

    fileFields.forEach(field => {
      if (
        employeeData[field] &&
        typeof employeeData[field] === 'object' &&
        employeeData[field]?.name
      ) {
        files[field] = employeeData[field];
      }
    });

    setUploadedFiles(files);
  } else {
    alert('No employee data found');
    navigate('/employees');
  }
}, []); // ✅ IMPORTANT

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload only PNG, JPG, JPEG, or PDF files');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      // Store file for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFiles(prev => ({
          ...prev,
          [fieldName]: { name: file.name, type: file.type, preview: reader.result }
        }));
      };
      reader.readAsDataURL(file);
      
      // Store file in formData
      setFormData(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const removeFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    setUploadedFiles(prev => {
      const newState = { ...prev };
      delete newState[fieldName];
      return newState;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Full name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.employeeId?.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.position?.trim()) newErrors.position = 'Position is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the errors before submitting');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get existing employees
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    
    // Find and update employee
    const index = employees.findIndex(emp => emp.id === formData.id);
    if (index !== -1) {
      const updatedEmployee = {
        ...formData,
        position: formData.position,
        designation: formData.position,
        currentSalary: formData.currentSalary,
        basicSalary: formData.basicSalary,
        updatedAt: new Date().toISOString(),
        // Keep existing documents if not replaced
        aadharCard: formData.aadharCard || employees[index].aadharCard,
        panCard: formData.panCard || employees[index].panCard,
        passportPhoto: formData.passportPhoto || employees[index].passportPhoto,
        bankPassbook: formData.bankPassbook || employees[index].bankPassbook,
        tenthMarksheet: formData.tenthMarksheet || employees[index].tenthMarksheet,
        twelfthMarksheet: formData.twelfthMarksheet || employees[index].twelfthMarksheet,
        graduationMarksheet: formData.graduationMarksheet || employees[index].graduationMarksheet,
        resume: formData.resume || employees[index].resume
      };
      
      employees[index] = updatedEmployee;
      localStorage.setItem('employees', JSON.stringify(employees));
      
      // Also update attendance and payroll data
      updateRelatedData(formData.employeeId, updatedEmployee);
    }
    
    setLoading(false);
    alert('Employee updated successfully!');
    navigate('/employees');
  };

  const updateRelatedData = (employeeId, updatedEmployee) => {
    // Update attendance data
    const attendance = JSON.parse(localStorage.getItem('attendanceData') || '[]');
    const updatedAttendance = attendance.map(record => {
      if (record.employeeId === employeeId) {
        return {
          ...record,
          employeeName: updatedEmployee.name,
          department: updatedEmployee.department
        };
      }
      return record;
    });
    localStorage.setItem('attendanceData', JSON.stringify(updatedAttendance));
    
    // Update payroll data
    const payroll = JSON.parse(localStorage.getItem('payrollData') || '[]');
    const updatedPayroll = payroll.map(record => {
      if (record.employeeId === employeeId) {
        return {
          ...record,
          name: updatedEmployee.name,
          email: updatedEmployee.email,
          department: updatedEmployee.department,
          position: updatedEmployee.position,
          basicSalary: parseFloat(updatedEmployee.basicSalary) || record.basicSalary,
          bankName: updatedEmployee.bankName,
          accountNumber: updatedEmployee.accountNumber
        };
      }
      return record;
    });
    localStorage.setItem('payrollData', JSON.stringify(updatedPayroll));
  };

  const FileUploadField = ({ label, fieldName, accept = ".pdf,.jpg,.jpeg,.png" }) => (
    <div className="file-upload-field">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {uploadedFiles[fieldName] ? (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            {uploadedFiles[fieldName].type?.startsWith('image/') ? (
              <img src={uploadedFiles[fieldName].preview} alt="preview" className="w-10 h-10 object-cover rounded" />
            ) : (
              <FiFile className="text-indigo-500 text-2xl" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-700">{uploadedFiles[fieldName].name}</p>
              <p className="text-xs text-gray-500">
                {(uploadedFiles[fieldName].preview?.length / 1024).toFixed(0)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeFile(fieldName)}
            className="text-red-500 hover:text-red-700 transition"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer block">
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileUpload(e, fieldName)}
            className="hidden"
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition cursor-pointer">
            <FiUpload className="mx-auto text-gray-400 text-2xl mb-2" />
            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF (Max 5MB)</p>
          </div>
        </label>
      )}
    </div>
  );

  const InputField = ({ label, name, type = "text", required, placeholder, icon: Icon }) => (
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border ${errors[name] ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition`}
        />
      </div>
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  const SelectField = ({ label, name, options, required }) => (
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  const TextAreaField = ({ label, name, rows = 3, placeholder }) => (
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <textarea
        name={name}
        rows={rows}
        value={formData[name] || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
      />
    </div>
  );

  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: FiUser },
    { id: 'family', label: 'Family Details', icon: FiUsers },
    { id: 'address', label: 'Address', icon: FiHome },
    { id: 'employment', label: 'Employment', icon: FiBriefcase },
    { id: 'salary', label: 'Salary & Bank', icon: FiDollarSign },
    { id: 'documents', label: 'Documents', icon: FiFile },
  ];

  return (
    <div className="edit-employee-page animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 -mt-6 -mx-4 md:-mx-6 px-4 md:px-6 py-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/employees')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Edit Employee</h1>
              <p className="text-sm text-gray-500 mt-1">
                Update information for {formData.name || 'Employee'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/employees')}
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
            >
              <FiSave size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Employee ID Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-4 md:p-6 mb-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {formData.name?.charAt(0) || 'E'}
            </div>
            <div>
              <p className="text-sm opacity-90">Employee ID</p>
              <p className="text-xl font-bold">{formData.employeeId || 'Not set'}</p>
              <p className="text-sm opacity-90 mt-1">{formData.department || 'Department not set'}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-sm opacity-90">Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                formData.status === 'Active' ? 'bg-green-400 text-green-900' : 'bg-yellow-400 text-yellow-900'
              }`}>
                {formData.status || 'Active'}
              </span>
            </div>
            <div>
              <p className="text-sm opacity-90">Joining Date</p>
              <p className="font-medium">{formData.joiningDate || 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="form-section">
            <h3 className="section-title">📋 Basic Information</h3>
            <div className="form-grid">
              <InputField 
                label="Full Name" 
                name="name" 
                required 
                placeholder="Enter full name"
               // icon={FiUser}
              />
              <InputField 
                label="Employee ID" 
                name="employeeId" 
                required 
                placeholder="EMP001"
               // icon={FiUser}
              />
              <InputField 
                label="Email Address" 
                name="email" 
                type="email" 
                required
                placeholder="employee@company.com"
             //   icon={FiMail}
              />
              <InputField 
                label="Phone Number" 
                name="phone" 
                type="tel" 
                 
                placeholder="+91 98765 43210"
               // icon={FiPhone}
              />
              <InputField 
                label="Date of Birth" 
                name="dateOfBirth" 
                type="date" 
                // icon={FiCalendar}
              />
              <SelectField 
                label="Gender" 
                name="gender" 
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' }
                ]}
              />
              <SelectField 
                label="Blood Group" 
                name="bloodGroup" 
                options={[
                  { value: '', label: 'Select' },
                  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
                  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' }
                ]}
              />
              <SelectField 
                label="Marital Status" 
                name="maritalStatus" 
                options={[
                  { value: 'Single', label: 'Single' },
                  { value: 'Married', label: 'Married' },
                  { value: 'Divorced', label: 'Divorced' },
                  { value: 'Widowed', label: 'Widowed' }
                ]}
              />
              <InputField 
                label="Nationality" 
                name="nationality" 
                placeholder="Indian"
              />
            </div>
          </div>
        )}

        {/* Family Information Tab */}
        {activeTab === 'family' && (
          <div className="form-section">
            <h3 className="section-title">👨‍👩‍👧‍👦 Family Information</h3>
            <div className="form-grid">
              <InputField label="Father's Name" name="fatherName" placeholder="Enter father's name" />
              <InputField label="Father's Contact" name="fatherContact" placeholder="+1 234 567 8900" />
              <InputField label="Mother's Name" name="motherName" placeholder="Enter mother's name" />
              <InputField label="Mother's Contact" name="motherContact" placeholder="+1 234 567 8900" />
              <InputField label="Spouse Name" name="spouseName" placeholder="Enter spouse name" />
              <InputField label="Spouse Contact" name="spouseContact" placeholder="+1 234 567 8900" />
            </div>
          </div>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && (
          <div className="form-section">
            <h3 className="section-title">📍 Address Information</h3>
            <div className="space-y-4">
              <TextAreaField 
                label="Current Address" 
                name="address" 
                rows={3}
                placeholder="House No., Street, City, State, PIN Code"
              />
              <TextAreaField 
                label="Permanent Address" 
                name="permanentAddress" 
                rows={3}
                placeholder="House No., Street, City, State, PIN Code"
              />
              <div className="form-grid">
                <InputField label="Emergency Contact Name" name="emergencyContactName" placeholder="Contact person name" />
                <InputField label="Relationship" name="emergencyContactRelation" placeholder="Father, Mother, Spouse" />
                <InputField label="Emergency Contact Number" name="emergencyContactNumber" placeholder="+1 234 567 8900" />
              </div>
            </div>
          </div>
        )}

        {/* Employment Tab */}
        {activeTab === 'employment' && (
          <div className="form-section">
            <h3 className="section-title">💼 Employment Information</h3>
            <div className="form-grid">
              <SelectField 
                label="Department" 
                name="department" 

                options={[
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'HR', label: 'Human Resources' },
                  { value: 'Finance', label: 'Finance' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Sales', label: 'Sales' },
                  { value: 'Operations', label: 'Operations' }
                ]}
              />
              <InputField 
                label="Position / Designation" 
                name="position" 
                
                placeholder="Senior Developer"
              />
              <InputField label="Work Location" name="workLocation" placeholder="City, Office location" />
              <SelectField 
                label="Employment Type" 
                name="employmentType" 
                options={[
                  { value: 'Full-time', label: 'Full-time' },
                  { value: 'Part-time', label: 'Part-time' },
                  { value: 'Contract', label: 'Contract' },
                  { value: 'Internship', label: 'Internship' }
                ]}
              />
              <InputField label="Joining Date" name="joiningDate" type="date" />
              <SelectField 
                label="Status" 
                name="status" 
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'On Leave', label: 'On Leave' },
                  { value: 'Resigned', label: 'Resigned' },
                  { value: 'Terminated', label: 'Terminated' }
                ]}
              />
            </div>
          </div>
        )}

        {/* Salary & Bank Tab */}
        {activeTab === 'salary' && (
          <div className="form-section">
            <h3 className="section-title">💰 Salary & Bank Information</h3>
            <div className="form-grid">
              <InputField label="Basic Salary (₹)" name="basicSalary" type="number" placeholder="50000" />
              <InputField label="Current Salary (₹)" name="currentSalary" type="number" placeholder="50000" />
              <InputField label="Previous Company" name="previousCompany" placeholder="Previous employer" />
              <InputField label="Previous Salary (₹)" name="previousSalary" type="number" placeholder="45000" />
            </div>
            
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">🏦 Bank Details</h4>
              <div className="form-grid">
                <InputField label="Bank Name" name="bankName" placeholder="Bank name" />
                <InputField label="Account Number" name="accountNumber" placeholder="Account number" />
                <InputField label="IFSC Code" name="ifscCode" placeholder="IFSC code" />
              </div>
              <div className="mt-4">
                <FileUploadField label="Bank Passbook / Cancelled Cheque" fieldName="bankPassbook" />
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="form-section">
            <h3 className="section-title">📎 Documents</h3>
            
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Personal Documents</h4>
              <div className="file-upload-grid">
                <FileUploadField label="Aadhar Card" fieldName="aadharCard" />
                <FileUploadField label="PAN Card" fieldName="panCard" />
                <FileUploadField label="Passport Size Photo" fieldName="passportPhoto" accept=".jpg,.jpeg,.png" />
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Educational Documents</h4>
              <div className="file-upload-grid">
                <FileUploadField label="10th Marksheet" fieldName="tenthMarksheet" />
                <FileUploadField label="12th Marksheet" fieldName="twelfthMarksheet" />
                <FileUploadField label="Graduation Marksheet" fieldName="graduationMarksheet" />
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4">Resume</h4>
              <FileUploadField label="Upload Resume" fieldName="resume" />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 -mx-4 md:-mx-6 px-4 md:px-6 py-4 mt-6">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <FiSave size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;