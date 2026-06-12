// src/components/EmployeeDocuments.jsx
import React, { useState } from 'react';
import { FiFile, FiDownload, FiEye, FiX } from 'react-icons/fi';
import { api } from '../services/api';

const DocumentViewer = ({ document, onClose }) => {
  if (!document) return null;

  const isImage = document.type?.startsWith('image/');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">{document.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <FiX size={20} />
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
          {isImage ? (
            <img src={document.url} alt={document.name} className="max-w-full" />
          ) : document.type === 'application/pdf' ? (
            <iframe 
              src={`${document.url}#toolbar=0`} 
              title={document.name}
              className="w-full h-[70vh]"
            />
          ) : (
            <div className="text-center py-8">
              <FiFile size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Preview not available for this file type</p>
              <a 
                href={document.url} 
                download={document.name}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                <FiDownload /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const EmployeeDocuments = ({ employeeId, employeeData }) => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  const viewDocument = async (docType, docName) => {
    setLoading(true);
    try {
      // Fetch document from backend
      const response = await api.get(`/api/employees/${employeeId}/documents/`, {
        params: { doc_type: docType }
      });
      
      // Open document in new tab or modal
      if (response.data.url) {
        setSelectedDoc({
          name: docName,
          url: response.data.url,
          type: response.data.content_type
        });
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      alert('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const documents = [
    { key: 'aadharCard', label: 'Aadhar Card' },
    { key: 'panCard', label: 'PAN Card' },
    { key: 'passportPhoto', label: 'Passport Photo' },
    { key: 'resume', label: 'Resume' },
    { key: 'bankPassbook', label: 'Bank Passbook' },
    { key: 'tenthMarksheet', label: '10th Marksheet' },
    { key: 'twelfthMarksheet', label: '12th Marksheet' },
    { key: 'graduationMarksheet', label: 'Graduation Marksheet' },
    { key: 'postGraduationMarksheet', label: 'Post Graduation Marksheet' },
    { key: 'previousSalarySlip', label: 'Previous Salary Slip' },
    { key: 'previousExperienceCertificate', label: 'Previous Experience Certificate' },
    { key: 'currentExperienceLetter', label: 'Current Experience Letter' },
    { key: 'offerLetter', label: 'Offer Letter' },
    { key: 'appointmentLetter', label: 'Appointment Letter' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => {
          const hasDocument = employeeData?.[doc.key];
          return (
            <div key={doc.key} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">{doc.label}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {hasDocument ? 'Document uploaded' : 'Not uploaded'}
                  </p>
                </div>
                {hasDocument && (
                  <button
                    onClick={() => viewDocument(doc.key, doc.label)}
                    disabled={loading}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  >
                    <FiEye size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedDoc && (
        <DocumentViewer 
          document={selectedDoc} 
          onClose={() => setSelectedDoc(null)} 
        />
      )}
    </div>
  );
};