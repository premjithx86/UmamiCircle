import React, { useState, useEffect } from 'react';
import { getReports, updateReport } from '../services/adminService';
import { AlertCircle, Search, Filter, Loader2, CheckCircle, XCircle, Clock, MessageSquare, ExternalLink } from 'lucide-react';

/**
 * Reports page for managing user-submitted reports.
 * @returns {JSX.Element}
 */
export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [targetType, setTargetType] = useState('');
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports({ status, targetType });
      setReports(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [status, targetType]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    const adminComment = window.prompt('Add an admin comment for this resolution:');
    if (adminComment === null) return; // Cancelled

    try {
      const updated = await updateReport(reportId, { status: newStatus, adminComment });
      setReports(reports.map(r => r._id === reportId ? updated : r));
      setSelectedReport(null);
    } catch (err) {
      alert('Failed to update report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Report Management</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="status-filter" className="flex items-center text-sm font-medium text-gray-600">
              <Filter className="w-4 h-4 mr-1" />
              Status:
            </label>
            <select
              id="status-filter"
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="dismissed">Dismissed</option>
              <option value="action_taken">Action Taken</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="type-filter" className="flex items-center text-sm font-medium text-gray-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              Type:
            </label>
            <select
              id="type-filter"
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="User">User</option>
              <option value="Post">Post</option>
              <option value="Recipe">Recipe</option>
              <option value="Comment">Comment</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Target</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold">Reporter</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
                    <p className="text-gray-500 mt-2">Loading reports...</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No reports found matching your criteria.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{report.targetType}</p>
                        <p className="text-gray-500 text-xs">ID: {report.targetId.substring(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {report.reason}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">@{report.reporter?.username || 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit space-x-1 ${
                        report.status === 'action_taken' ? 'bg-green-100 text-green-700' :
                        report.status === 'dismissed' ? 'bg-gray-100 text-gray-700' :
                        report.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {report.status === 'action_taken' && <CheckCircle className="w-3 h-3" />}
                        {report.status === 'dismissed' && <XCircle className="w-3 h-3" />}
                        {report.status === 'pending' && <Clock className="w-3 h-3" />}
                        <span>{report.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedReport(selectedReport?._id === report._id ? null : report)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedReport?._id === report._id ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title="Review Report"
                        aria-label="Review Report"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReport && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Process Report</h3>
              <p className="text-sm text-gray-600">Resolving report for {selectedReport.targetType} ({selectedReport.targetId})</p>
            </div>
            <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-orange-100">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Reason for report:</p>
            <p className="text-gray-800">{selectedReport.reason}</p>
            {selectedReport.adminComment && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Previous Admin Comment:</p>
                <p className="text-gray-700 italic">"{selectedReport.adminComment}"</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleUpdateStatus(selectedReport._id, 'action_taken')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Mark Action Taken
            </button>
            <button
              onClick={() => handleUpdateStatus(selectedReport._id, 'reviewed')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Mark Reviewed
            </button>
            <button
              onClick={() => handleUpdateStatus(selectedReport._id, 'dismissed')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Dismiss Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
