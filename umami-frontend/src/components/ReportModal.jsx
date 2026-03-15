import React, { useState } from 'react';
import { Modal } from './Modal';
import { ReportForm } from './ReportForm';
import api from '../services/api';

const ReportModal = ({ isOpen, onClose, targetId, targetType }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (reportData) => {
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        reason: `${reportData.reason}: ${reportData.description || 'No additional details'}`,
      };

      await api.post(`/social/report/${targetType}/${targetId}`, payload);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Report error:', err);
      setError(err.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Report ${targetType}`}
    >
      {success ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thank You</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Your report has been submitted. Our team will review it shortly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}
          <ReportForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            loading={loading}
          />
        </div>
      )}
    </Modal>
  );
};

export { ReportModal };
