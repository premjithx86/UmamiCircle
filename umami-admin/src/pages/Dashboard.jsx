import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/adminService';
import { Users, FileText, Activity, AlertCircle, RefreshCw, Globe } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  Legend
} from 'recharts';

/**
 * Dashboard page displaying platform metrics and demographic charts.
 */
export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Mock data for demographic chart (Top Countries)
  const countryData = [
    { name: 'USA', users: 4500, color: '#f97316' },
    { name: 'India', users: 3200, color: '#fb923c' },
    { name: 'UK', users: 2100, color: '#fdba74' },
    { name: 'Canada', users: 1800, color: '#fed7aa' },
    { name: 'Australia', users: 1200, color: '#ffedd5' },
  ];

  // Mock data for activity line chart
  const activityData = [
    { name: 'Mon', posts: 40, recipes: 24 },
    { name: 'Tue', posts: 30, recipes: 13 },
    { name: 'Wed', posts: 20, recipes: 98 },
    { name: 'Thu', posts: 27, recipes: 39 },
    { name: 'Fri', posts: 18, recipes: 48 },
    { name: 'Sat', posts: 23, recipes: 38 },
    { name: 'Sun', posts: 34, recipes: 43 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span>{error}</span>
        <button onClick={fetchStats} className="ml-auto bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-sm transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-500' },
    { title: 'Total Posts', value: stats?.totalPosts || 0, icon: FileText, color: 'bg-green-500' },
    { title: 'Total Recipes', value: stats?.totalRecipes || 0, icon: FileText, color: 'bg-orange-500' },
    { title: 'Daily Posts', value: stats?.dailyPosts || 0, icon: Activity, color: 'bg-indigo-500' },
    { title: 'Active Users', value: stats?.activeUsers || 0, icon: Activity, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
        <button onClick={fetchStats} className="p-2 text-gray-500 hover:text-orange-600 transition-colors" title="Refresh stats">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
            <div className={`${card.color} p-3 rounded-xl`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Countries Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-6 text-gray-900 dark:text-white font-bold text-lg">
            <Globe size={20} className="text-orange-500" />
            <h2>Top Countries</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="users" radius={[0, 4, 4, 0]}>
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Activity Line Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-6 text-gray-900 dark:text-white font-bold text-lg">
            <Activity size={20} className="text-blue-500" />
            <h2>Engagement Trends</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="recipes" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
