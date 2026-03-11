import React, { useState } from 'react';
import Button from './Button';

const REASONS = [
  'Spam',
  'Inappropriate Content',
  'Harassment',
  'Hate Speech',
  'False Information',
  'Other',
];

const ReportForm = ({ onSubmit, onCancel }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedReason) return;
    onSubmit({ reason: selectedReason, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Why are you reporting this?
        </p>
        <div className="grid grid-cols-1 gap-2">
          {REASONS.map((reason) => (
            <label
              key={reason}
              className={`
                flex items-center px-4 py-3 border rounded-xl cursor-pointer transition-all duration-200
                ${selectedReason === reason
                  ? 'border-primary bg-orange-50 dark:bg-orange-900/10'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              <input
                type="radio"
                name="reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                {reason}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="report-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Additional Details (Optional)
        </label>
        <textarea
          id="report-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details..."
          rows="3"
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200"
        />
      </div>

      <div className="flex items-center space-x-3 pt-4">
        <Button
          type="submit"
          className="flex-1"
          disabled={!selectedReason}
        >
          Submit Report
        </Button>
        <Button
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export { ReportForm };
