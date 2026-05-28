// src/pages/AddEmployee.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX, FiUpload, FiFile, FiImage, FiTrash2 } from 'react-icons/fi';

const AddEmployee = () => {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload (supports PNG, JPG, PDF)
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

  // Remove uploaded file
  const removeFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    setUploadedFiles(prev => {
      const newState = { ...prev };
      delete newState[fieldName];
      return newState;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.employeeId || !formData.phone) {
      alert('Please fill in all required fields: Full Name, Email, Employee ID, and Phone Number');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create employee object
    const employeeToSave = {
      id: Date.now(),
      name: formData.fullName,
      email: formData.email,
      department: formData.department,
      position: formData.designation || 'Staff',
      joinDate: formData.joiningDate || new Date().toISOString().split('T')[0],
      status: formData.status,
      phone: formData.phone,
      ...formData,
      // Store file info for demo (in real app, you'd upload to server)
      documents: Object.keys(uploadedFiles).map(key => uploadedFiles[key].name)
    };
    
    // Get existing employees from localStorage or initialize empty array
    const existingEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    existingEmployees.push(employeeToSave);
    localStorage.setItem('employees', JSON.stringify(existingEmployees));
    
    setLoading(false);
    alert('Employee added successfully!');
    
    // Navigate back to employees page
    navigate('/employees');
  };

  // File input renderer with preview
  const FileUploadField = ({ label, fieldName, required, accept = ".pdf,.jpg,.jpeg,.png" }) => (
    <div className="file-upload-field">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {uploadedFiles[fieldName] ? (
        <div className="file-preview">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              {uploadedFiles[fieldName].type.startsWith('image/') ? (
                <img src={uploadedFiles[fieldName].preview} alt="preview" className="w-10 h-10 object-cover rounded" />
              ) : (
                <FiFile className="text-red-500 text-2xl" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-700">{uploadedFiles[fieldName].name}</p>
                <p className="text-xs text-gray-500">
                  {(uploadedFiles[fieldName].preview.length / 1024).toFixed(0)} KB
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
        </div>
      ) : (
        <label className="file-upload-label">
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

  return (
    <div className="add-employee-page">
      {/* Page Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Add New Employee</h1>
            <p className="text-gray-500 mt-1">Fill in all the details below to add a new employee</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
        >
          <FiSave size={18} />
          {loading ? 'Saving...' : 'Save Employee'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="form-section">
          <h3 className="section-title">📋 Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Employee ID *</label>
              <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                <option value="">Select</option>
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
              </select>
            </div>
            <div className="form-group">
              <label>Marital Status</label>
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nationality</label>
              <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* Family Information Section */}
        <div className="form-section">
          <h3 className="section-title">👨‍👩‍👧‍👦 Family Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Father's Name</label>
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Father's Contact</label>
              <input type="tel" name="fatherContact" value={formData.fatherContact} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Mother's Name</label>
              <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Mother's Contact</label>
              <input type="tel" name="motherContact" value={formData.motherContact} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Spouse Name</label>
              <input type="text" name="spouseName" value={formData.spouseName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Spouse Contact</label>
              <input type="tel" name="spouseContact" value={formData.spouseContact} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3 className="section-title">📍 Address Information</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label>Current Address</label>
              <textarea name="address" rows="3" value={formData.address} onChange={handleChange} 
                placeholder="House No., Street, City, State, PIN Code"></textarea>
            </div>
            <div className="form-group">
              <label>Permanent Address</label>
              <textarea name="permanentAddress" rows="3" value={formData.permanentAddress} onChange={handleChange}
                placeholder="House No., Street, City, State, PIN Code"></textarea>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="form-section">
          <h3 className="section-title">🚨 Emergency Contact</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Contact Person Name</label>
              <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Job Information */}
        <div className="form-section">
          <h3 className="section-title">💼 Job Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Department</label>
              <select name="department" value={formData.department} onChange={handleChange}>
                <option>Engineering</option><option>HR</option><option>Finance</option>
                <option>Marketing</option><option>Sales</option><option>Operations</option>
              </select>
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Work Location</label>
              <input type="text" name="workLocation" value={formData.workLocation} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Employment Type</label>
              <select name="employmentType" value={formData.employmentType} onChange={handleChange}>
                <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
              </select>
            </div>
            <div className="form-group">
              <label>Joining Date</label>
              <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option>Active</option><option>On Leave</option><option>Resigned</option><option>Terminated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Previous Employment */}
        <div className="form-section">
          <h3 className="section-title">📊 Previous Employment</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Previous Company</label>
              <input type="text" name="previousCompany" value={formData.previousCompany} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Previous Salary (₹)</label>
              <input type="number" name="previousSalary" value={formData.previousSalary} onChange={handleChange} />
            </div>
          </div>
          <div className="file-upload-grid">
            <FileUploadField label="Previous Salary Slip" fieldName="previousSalarySlip" />
            <FileUploadField label="Previous Experience Certificate" fieldName="previousExperienceCertificate" />
          </div>
        </div>

        {/* Current Employment Documents */}
        <div className="form-section">
          <h3 className="section-title">💰 Current Employment Documents</h3>
          <div className="form-group">
            <label>Current Salary (₹)</label>
            <input type="number" name="currentSalary" value={formData.currentSalary} onChange={handleChange} />
          </div>
          <div className="file-upload-grid">
            <FileUploadField label="Current Experience Letter" fieldName="currentExperienceLetter" />
            <FileUploadField label="Offer Letter" fieldName="offerLetter" />
            <FileUploadField label="Appointment Letter" fieldName="appointmentLetter" />
          </div>
        </div>

        {/* Bank Information */}
        <div className="form-section">
          <h3 className="section-title">🏦 Bank Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Bank Name</label>
              <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>IFSC Code</label>
              <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} />
            </div>
          </div>
          <FileUploadField label="Bank Passbook / Cancelled Cheque" fieldName="bankPassbook" />
        </div>

        {/* Personal Documents */}
        <div className="form-section">
          <h3 className="section-title">📎 Personal Documents</h3>
          <div className="file-upload-grid">
            <FileUploadField label="Aadhar Card" fieldName="aadharCard" />
            <FileUploadField label="PAN Card" fieldName="panCard" />
            <FileUploadField label="Passport Size Photo" fieldName="passportPhoto" accept=".jpg,.jpeg,.png" />
          </div>
        </div>

        {/* Educational Documents */}
        <div className="form-section">
          <h3 className="section-title">🎓 Educational Documents</h3>
          <div className="file-upload-grid">
            <FileUploadField label="10th Marksheet" fieldName="tenthMarksheet" />
            <FileUploadField label="12th Marksheet" fieldName="twelfthMarksheet" />
            <FileUploadField label="Graduation Marksheet" fieldName="graduationMarksheet" />
            <FileUploadField label="Post Graduation Marksheet" fieldName="postGraduationMarksheet" />
          </div>
        </div>

        {/* Resume Upload */}
        <div className="form-section">
          <h3 className="section-title">📄 Resume</h3>
          <FileUploadField label="Upload Resume" fieldName="resume" />
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;