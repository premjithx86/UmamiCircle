import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/adminService';
import { History, Filter, Loader2, Shield, User as UserIcon, FileText, AlertCircle, Search } from 'lucide-react';

/**
 * Activity Logs page for viewing administrative audit trail.
 * @returns {JSX.Element}
 */
export const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [targetType, setTargetType] = useState('');
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs({ action, targetType });
      setLogs(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch audit logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [action, targetType]);

  const getActionColor = (actionName) => {
    if (actionName.includes('DELETE')) return 'text-red-600 bg-red-50';
    if (actionName.includes('BLOCK')) return 'text-orange-600 bg-orange-50';
    if (actionName.includes('RESOLVE')) return 'text-green-600 bg-green-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="action-filter" className="flex items-center text-sm font-medium text-gray-600">
              <History className="w-4 h-4 mr-1" />
              Action:
            </label>
            <select
              id="action-filter"
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="BLOCK_USER">Block User</option>
              <option value="UNBLOCK_USER">Unblock User</option>
              <option value="DELETE_USER">Delete User</option>
              <option value="DELETE_POST">Delete Post</option>
              <option value="DELETE_RECIPE">Delete Recipe</option>
              <option value="RESOLVE_REPORT">Resolve Report</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="type-filter" className="flex items-center text-sm font-medium text-gray-600">
              <Filter className="w-4 h-4 mr-1" />
              Target Type:
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
              <option value="Report">Report</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Admin</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Target</th>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
                    <p className="text-gray-500 mt-2">Loading audit logs...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">@{log.admin?.username || 'Unknown'}</p>
                        <p className="text-gray-500 text-xs">{log.admin?.role}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-tight ${getActionColor(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">{log.targetType}</p>
                        <p className="text-gray-500 text-xs font-mono">{log.targetId?.substring(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
