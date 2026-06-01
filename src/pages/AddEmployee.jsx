// src/pages/AddEmployee.jsx (Completely Fixed - No Focus Issues)
import React, { useState, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX, FiUpload, FiFile, FiTrash2 } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

// Move components outside to prevent recreation on each render
const InputField = memo(({ label, name, type = "text", required, placeholder, value, error, onChange }) => (
  <div className="form-group">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
));

const SelectField = memo(({ label, name, options, required, value, onChange }) => (
  <div className="form-group">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
));

const TextAreaField = memo(({ label, name, rows = 3, placeholder, value, onChange }) => (
  <div className="form-group">
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <textarea
      name={name}
      rows={rows}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
    />
  </div>
));

const FileUploadField = memo(({ label, fieldName, uploadedFile, onFileUpload, onFileRemove, accept = ".pdf,.jpg,.jpeg,.png" }) => (
  <div className="file-upload-field">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    {uploadedFile ? (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          {uploadedFile.type?.startsWith('image/') ? (
            <img src={uploadedFile.preview} alt="preview" className="w-10 h-10 object-cover rounded" />
          ) : (
            <FiFile className="text-indigo-500 text-2xl" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-700">{uploadedFile.name}</p>
            <p className="text-xs text-gray-500">
              {Math.round((uploadedFile.preview?.length || 0) / 1024)} KB
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onFileRemove(fieldName)}
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
          onChange={(e) => onFileUpload(e, fieldName)}
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
));

const AddEmployee = () => {
  const navigate = useNavigate();
  const { refreshData } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    employeeId: '',
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: '',
    maritalStatus: 'Single',
    nationality: 'Indian',
    phone: '',
    email: '',
    
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
    designation: '',
    workLocation: '',
    employmentType: 'Full-time',
    joiningDate: '',
    status: 'Active',
    
    // Previous Employment
    previousCompany: '',
    previousSalary: '',
    previousSalarySlip: null,
    previousExperienceCertificate: null,
    
    // Current Employment
    currentSalary: '',
    currentExperienceLetter: null,
    offerLetter: null,
    appointmentLetter: null,
    
    // Bank Information
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    bankPassbook: null,
    
    // Personal Documents
    aadharCard: null,
    panCard: null,
    passportPhoto: null,
    
    // Educational Documents
    tenthMarksheet: null,
    twelfthMarksheet: null,
    graduationMarksheet: null,
    postGraduationMarksheet: null,
    
    // Resume
    resume: null
  });

  const [uploadedFiles, setUploadedFiles] = useState({});
  const [errors, setErrors] = useState({});

  // Handle text input changes - use useCallback to prevent recreation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Handle file upload
  const handleFileUpload = useCallback((e, fieldName) => {
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
  }, []);

  // Remove uploaded file
  const handleRemoveFile = useCallback((fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    setUploadedFiles(prev => {
      const newState = { ...prev };
      delete newState[fieldName];
      return newState;
    });
  }, []);

  // Validate form before submission
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.employeeId?.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.designation?.trim()) newErrors.designation = 'Designation is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the errors before submitting');
      return;
    }
    
    setLoading(true);
    
    // Create employee object for saving
    const employeeToSave = {
      id: Date.now(),
      employeeId: formData.employeeId,
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      position: formData.designation,
      designation: formData.designation,
      joinDate: formData.joiningDate || new Date().toISOString().split('T')[0],
      status: formData.status,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      maritalStatus: formData.maritalStatus,
      nationality: formData.nationality,
      address: formData.address,
      permanentAddress: formData.permanentAddress,
      fatherName: formData.fatherName,
      fatherContact: formData.fatherContact,
      motherName: formData.motherName,
      motherContact: formData.motherContact,
      spouseName: formData.spouseName,
      spouseContact: formData.spouseContact,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactRelation: formData.emergencyContactRelation,
      emergencyContactNumber: formData.emergencyContactNumber,
      workLocation: formData.workLocation,
      employmentType: formData.employmentType,
      basicSalary: formData.currentSalary,
      currentSalary: formData.currentSalary,
      previousCompany: formData.previousCompany,
      previousSalary: formData.previousSalary,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      bankPassbook: formData.bankPassbook ? formData.bankPassbook.name : null,
      aadharCard: formData.aadharCard ? formData.aadharCard.name : null,
      panCard: formData.panCard ? formData.panCard.name : null,
      passportPhoto: formData.passportPhoto ? formData.passportPhoto.name : null,
      tenthMarksheet: formData.tenthMarksheet ? formData.tenthMarksheet.name : null,
      twelfthMarksheet: formData.twelfthMarksheet ? formData.twelfthMarksheet.name : null,
      graduationMarksheet: formData.graduationMarksheet ? formData.graduationMarksheet.name : null,
      postGraduationMarksheet: formData.postGraduationMarksheet ? formData.postGraduationMarksheet.name : null,
      resume: formData.resume ? formData.resume.name : null,
      previousSalarySlip: formData.previousSalarySlip ? formData.previousSalarySlip.name : null,
      previousExperienceCertificate: formData.previousExperienceCertificate ? formData.previousExperienceCertificate.name : null,
      currentExperienceLetter: formData.currentExperienceLetter ? formData.currentExperienceLetter.name : null,
      offerLetter: formData.offerLetter ? formData.offerLetter.name : null,
      appointmentLetter: formData.appointmentLetter ? formData.appointmentLetter.name : null,
      createdAt: new Date().toISOString(),
      documents: Object.keys(uploadedFiles).map(key => uploadedFiles[key].name)
    };
    
    try {
      // Get existing employees
      const existingEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      existingEmployees.push(employeeToSave);
      localStorage.setItem('employees', JSON.stringify(existingEmployees));
      
      // Also update payroll data for this employee
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      const existingPayroll = JSON.parse(localStorage.getItem('payrollData') || '[]');
      
      const newPayrollRecord = {
        id: employeeToSave.id,
        employeeId: employeeToSave.employeeId,
        name: employeeToSave.name,
        email: employeeToSave.email,
        department: employeeToSave.department,
        position: employeeToSave.position,
        basicSalary: parseFloat(employeeToSave.basicSalary) || 0,
        allowance: 0,
        bonus: 0,
        deductions: 0,
        netSalary: parseFloat(employeeToSave.basicSalary) || 0,
        status: 'Pending',
        month: currentMonth,
        date: new Date().toISOString().split('T')[0]
      };
      
      existingPayroll.push(newPayrollRecord);
      localStorage.setItem('payrollData', JSON.stringify(existingPayroll));
      
      // Add to recent activities
      const existingActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
      const newActivity = {
        id: Date.now(),
        title: `${employeeToSave.name} has joined the company`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: employeeToSave.position,
        type: 'hire'
      };
      existingActivities.unshift(newActivity);
      localStorage.setItem('recentActivities', JSON.stringify(existingActivities.slice(0, 10)));
      
      // IMPORTANT: Refresh the dashboard data
      refreshData();
      
      setLoading(false);
      alert('Employee added successfully!');
      navigate('/employees');
      
    } catch (error) {
      console.error('Error saving employee:', error);
      setLoading(false);
      alert('Error saving employee. Please try again.');
    }
  }, [formData, validateForm, refreshData, navigate, uploadedFiles]);

  // Memoize options to prevent recreation
  const genderOptions = useMemo(() => [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ], []);

  const bloodGroupOptions = useMemo(() => [
    { value: '', label: 'Select' },
    { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
    { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
    { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' }
  ], []);

  const maritalStatusOptions = useMemo(() => [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widowed', label: 'Widowed' }
  ], []);

  const departmentOptions = useMemo(() => [
    { value: 'Engineering', label: 'Engineering' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Operations', label: 'Operations' }
  ], []);

  const employmentTypeOptions = useMemo(() => [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Internship', label: 'Internship' }
  ], []);

  const statusOptions = useMemo(() => [
    { value: 'Active', label: 'Active' },
    { value: 'On Leave', label: 'On Leave' },
    { value: 'Resigned', label: 'Resigned' },
    { value: 'Terminated', label: 'Terminated' }
  ], []);

  return (
    <div className="add-employee-page animate-fade-in pb-8">
      {/* Page Header with Back Button */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 -mt-6 -mx-4 md:-mx-6 px-4 md:px-6 py-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Add New Employee</h1>
              <p className="text-sm text-gray-500 mt-1">Fill in all the details below to add a new employee</p>
            </div>
          </div>
          <button
            type="submit"
            form="employee-form"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
          >
            <FiSave size={18} />
            {loading ? 'Saving...' : 'Save Employee'}
          </button>
        </div>
      </div>

      <form id="employee-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="form-section">
          <h3 className="section-title">📋 Basic Information</h3>
          <div className="form-grid">
            <InputField 
              label="Full Name" 
              name="fullName" 
              required 
              placeholder="Enter full name"
              value={formData.fullName}
              error={errors.fullName}
              onChange={handleChange}
            />
            <InputField 
              label="Employee ID" 
              name="employeeId" 
              required 
              placeholder="EMP001"
              value={formData.employeeId}
              error={errors.employeeId}
              onChange={handleChange}
            />
            <InputField 
              label="Date of Birth" 
              name="dateOfBirth" 
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
            <SelectField 
              label="Gender" 
              name="gender" 
              options={genderOptions}
              value={formData.gender}
              onChange={handleChange}
            />
            <SelectField 
              label="Blood Group" 
              name="bloodGroup" 
              options={bloodGroupOptions}
              value={formData.bloodGroup}
              onChange={handleChange}
            />
            <SelectField 
              label="Marital Status" 
              name="maritalStatus" 
              options={maritalStatusOptions}
              value={formData.maritalStatus}
              onChange={handleChange}
            />
            <InputField 
              label="Nationality" 
              name="nationality" 
              placeholder="Indian"
              value={formData.nationality}
              onChange={handleChange}
            />
            <InputField 
              label="Phone Number" 
              name="phone" 
              type="tel" 
              required 
              placeholder="+91 98765 43210"
              value={formData.phone}
              error={errors.phone}
              onChange={handleChange}
            />
            <InputField 
              label="Email Address" 
              name="email" 
              type="email" 
              required 
              placeholder="employee@company.com"
              value={formData.email}
              error={errors.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Family Information Section */}
        <div className="form-section">
          <h3 className="section-title">👨‍👩‍👧‍👦 Family Information</h3>
          <div className="form-grid">
            <InputField 
              label="Father's Name" 
              name="fatherName" 
              placeholder="Enter father's name"
              value={formData.fatherName}
              onChange={handleChange}
            />
            <InputField 
              label="Father's Contact" 
              name="fatherContact" 
              placeholder="+91 98765 43210"
              value={formData.fatherContact}
              onChange={handleChange}
            />
            <InputField 
              label="Mother's Name" 
              name="motherName" 
              placeholder="Enter mother's name"
              value={formData.motherName}
              onChange={handleChange}
            />
            <InputField 
              label="Mother's Contact" 
              name="motherContact" 
              placeholder="+91 98765 43210"
              value={formData.motherContact}
              onChange={handleChange}
            />
            <InputField 
              label="Spouse Name" 
              name="spouseName" 
              placeholder="Enter spouse name"
              value={formData.spouseName}
              onChange={handleChange}
            />
            <InputField 
              label="Spouse Contact" 
              name="spouseContact" 
              placeholder="+91 98765 43210"
              value={formData.spouseContact}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3 className="section-title">📍 Address Information</h3>
          <div className="space-y-4">
            <TextAreaField 
              label="Current Address" 
              name="address" 
              rows={3}
              placeholder="House No., Street, City, State, PIN Code"
              value={formData.address}
              onChange={handleChange}
            />
            <TextAreaField 
              label="Permanent Address" 
              name="permanentAddress" 
              rows={3}
              placeholder="House No., Street, City, State, PIN Code"
              value={formData.permanentAddress}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="form-section">
          <h3 className="section-title">🚨 Emergency Contact</h3>
          <div className="form-grid">
            <InputField 
              label="Contact Person Name" 
              name="emergencyContactName" 
              placeholder="Contact person name"
              value={formData.emergencyContactName}
              onChange={handleChange}
            />
            <InputField 
              label="Relationship" 
              name="emergencyContactRelation" 
              placeholder="Father, Mother, Spouse"
              value={formData.emergencyContactRelation}
              onChange={handleChange}
            />
            <InputField 
              label="Contact Number" 
              name="emergencyContactNumber" 
              placeholder="+91 98765 43210"
              value={formData.emergencyContactNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Job Information */}
        <div className="form-section">
          <h3 className="section-title">💼 Job Information</h3>
          <div className="form-grid">
            <SelectField 
              label="Department" 
              name="department" 
              required
              options={departmentOptions}
              value={formData.department}
              onChange={handleChange}
            />
            <InputField 
              label="Designation" 
              name="designation" 
              required 
              placeholder="Senior Developer"
              value={formData.designation}
              error={errors.designation}
              onChange={handleChange}
            />
            <InputField 
              label="Work Location" 
              name="workLocation" 
              placeholder="City, Office location"
              value={formData.workLocation}
              onChange={handleChange}
            />
            <SelectField 
              label="Employment Type" 
              name="employmentType" 
              options={employmentTypeOptions}
              value={formData.employmentType}
              onChange={handleChange}
            />
            <InputField 
              label="Joining Date" 
              name="joiningDate" 
              type="date"
              value={formData.joiningDate}
              onChange={handleChange}
            />
            <SelectField 
              label="Status" 
              name="status" 
              options={statusOptions}
              value={formData.status}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Previous Employment */}
        <div className="form-section">
          <h3 className="section-title">📊 Previous Employment</h3>
          <div className="form-grid">
            <InputField 
              label="Previous Company" 
              name="previousCompany" 
              placeholder="Previous employer"
              value={formData.previousCompany}
              onChange={handleChange}
            />
            <InputField 
              label="Previous Salary (₹)" 
              name="previousSalary" 
              type="number" 
              placeholder="50000"
              value={formData.previousSalary}
              onChange={handleChange}
            />
          </div>
          <div className="file-upload-grid">
            <FileUploadField 
              label="Previous Salary Slip" 
              fieldName="previousSalarySlip"
              uploadedFile={uploadedFiles.previousSalarySlip}
              onFileUpload={handleFileUpload}
              onFileRemove={handleRemoveFile}
            />
            <FileUploadField 
              label="Previous Experience Certificate" 
              fieldName="previousExperienceCertificate"
              uploadedFile={uploadedFiles.previousExperienceCertificate}
              onFileUpload={handleFileUpload}
              onFileRemove={handleRemoveFile}
            />
          </div>
        </div>

        {/* Current Employment Documents */}
        <div className="form-section">
          <h3 className="section-title">💰 Current Employment Documents</h3>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Salary (₹)</label>
            <input
              type="number"
              name="currentSalary"
              value={formData.currentSalary}
              onChange={handleChange}
              placeholder="50000"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="file-upload-grid">
            <FileUploadField 
              label="Current Experience Letter" 
              fieldName="currentExperienceLetter"
              uploadedFile={uploadedFiles.currentExperienceLetter}
              onFileUpload={handleFileUpload}
              onFileRemove={handleRemoveFile}
            />
            <FileUploadField 
              label="Offer Letter" 
              fieldName="offerLetter"
              uploadedFile={uploadedFiles.offerLetter}
              onFileUpload={handleFileUpload}
              onFileRemove={handleRemoveFile}
            />
            <FileUploadField 
              label="Appointment Letter" 
              fieldName="appointmentLetter"
              uploadedFile={uploadedFiles.appointmentLetter}
              onFileUpload={handleFileUpload}
              onFileRemove={handleRemoveFile}
            />
          </div>
        </div>

        {/* Bank Information */}
        <div className="form-section">
          <h3 className="section-title">🏦 Bank Information</h3>
          <div className="form-grid">
            <InputField 
              label="Bank Name" 
              name="bankName" 
              placeholder="Bank name"
              value={formData.bankName}
              onChange={handleChange}
            />
            <InputField 
              label="Account Number" 
              name="accountNumber" 
              placeholder="Account number"
              value={formData.accountNumber}
              onChange={handleChange}
            />
            <InputField 
              label="IFSC Code" 
              name="ifscCode" 
              placeholder="IFSC code"
              value={formData.ifscCode}
              onChange={handleChange}
            />
          </div>
          <FileUploadField 
            label="Bank Passbook / Cancelled Cheque" 
            fieldName="bankPassbook"
            uploadedFile={uploadedFiles.bankPassbook}
            onFileUpload={handleFileUpload}
            onFileRemove={handleRemoveFile}
          />
        </div>

        {/* Personal Documents */}
        <div className="form-section">
          <h3 className="section-title">📎 Personal Documents</h3>
          <div className="file-upload-grid">
            <FileUploadField 
              label="Aadhar Card" 
              fieldName="aadharCard"
              uploadedFile={uploadedFiles.aadharCard}
              onFileUpload={handleFileUpload}
              onFileRemove={handleRemoveFile}
            />
            <FileUploadField 
              label="PAN Card" 
              fieldName="panCard"
              uploadedFile={uploadedFiles.panCard}
              onFileUpload={handleFileUpload}
              onFileRemove={handleRemoveFile}
            />
            <FileUploadField 
              label="Passport Size Photo" 
              fieldName="passportPhoto" 
              accept=".jpg,.jpeg,.png"
              uploadedFile={uploadedFiles.passportPhoto}
              onFileUpload={handleFileUpload}
              onFileRemove={handleRemoveFile}
            />
          </div>
        </div>

        {/* Educational Documents */}
        <div className="form-section">
          <h3 className="section-title">🎓 Educational Documents</h3>
          <div className="file-upload-grid">
            <FileUploadField 
              label="10th Marksheet" 
              fieldName="tenthMarksheet"
              uploadedFile={uploadedFiles.tenthMarksheet}
              onFileUpload={handleFileUpload}
              onFileRemove={handleRemoveFile}
            />
            <FileUploadField 
              label="12th Marksheet" 
              fieldName="twelfthMarksheet"
              uploadedFile={uploadedFiles.twelfthMarksheet}
              onFileUpload={handleFileUpload}
              onFileRemove={handleRemoveFile}
            />
            <FileUploadField 
              label="Graduation Marksheet" 
              fieldName="graduationMarksheet"
              uploadedFile={uploadedFiles.graduationMarksheet}
              onFileUpload={handleFileUpload}
              onFileRemove={handleRemoveFile}
            />
            <FileUploadField 
              label="Post Graduation Marksheet" 
              fieldName="postGraduationMarksheet"
              uploadedFile={uploadedFiles.postGraduationMarksheet}
              onFileUpload={handleFileUpload}
              onFileRemove={handleRemoveFile}
            />
          </div>
        </div>

        {/* Resume Upload */}
        <div className="form-section">
          <h3 className="section-title">📄 Resume</h3>
          <FileUploadField 
            label="Upload Resume" 
            fieldName="resume"
            uploadedFile={uploadedFiles.resume}
            onFileUpload={handleFileUpload}
            onFileRemove={handleRemoveFile}
          />
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;