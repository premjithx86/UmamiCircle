import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { UserList } from '../components/UserList';
import { ContentGrid } from '../components/ContentGrid';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Settings as SettingsIcon, Shield, Bookmark, User as UserIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userData } = useAuth();

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/social/blocked');
      setBlockedUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch blocked users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/social/bookmarks');
      // Format bookmarks for ContentGrid (assuming API returns objects with target content)
      const formatted = response.data.map(b => ({
        ...b.targetId,
        _id: b.targetId._id,
        type: b.targetType
      }));
      setBookmarks(formatted);
    } catch (err) {
      console.error('Failed to fetch bookmarks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'blocked') fetchBlockedUsers();
    if (activeTab === 'bookmarks') fetchBookmarks();
  }, [activeTab]);

  const handleUnblock = async (userId) => {
    try {
      await api.post(`/social/unblock/${userId}`);
      setBlockedUsers(blockedUsers.filter(u => u._id !== userId));
    } catch (err) {
      alert('Failed to unblock user');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <SEO title="Settings" description="Manage your UmamiCircle account settings." />
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-64 space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center px-2">
            <SettingsIcon className="mr-2" size={24} /> Settings
          </h1>
          
          <button
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'account' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <UserIcon size={20} />
            <span className="font-bold">Account</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'bookmarks' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Bookmark size={20} />
            <span className="font-bold">Bookmarks</span>
          </button>

          <button
            onClick={() => setActiveTab('blocked')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'blocked' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Shield size={20} />
            <span className="font-bold">Blocked Users</span>
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1">
          <Card className="min-h-[500px]">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Overview</h2>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</p>
                      <p className="text-gray-900 dark:text-white font-medium">@{userData?.username}</p>
                    </div>
                    <Link to={`/u/${userData?.username}`} className="text-orange-600 hover:text-orange-500 flex items-center text-sm font-bold">
                      View Profile <ChevronRight size={16} />
                    </Link>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="text-gray-900 dark:text-white font-medium">{userData?.email}</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Preferences</h3>
                  {/* Theme info could go here, though it's already in Navbar */}
                  <p className="text-sm text-gray-500">More account settings coming soon.</p>
                </div>
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Content</h2>
                {loading ? (
                  <div className="flex justify-center py-20"><LoadingSpinner /></div>
                ) : bookmarks.length > 0 ? (
                  <ContentGrid items={bookmarks} />
                ) : (
                  <div className="text-center py-20 text-gray-500">
                    <p>No bookmarks yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'blocked' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy & Safety</h2>
                <p className="text-sm text-gray-500 mb-4">Users you block will not be able to see your content or message you.</p>
                {loading ? (
                  <div className="flex justify-center py-20"><LoadingSpinner /></div>
                ) : blockedUsers.length > 0 ? (
                  <UserList 
                    users={blockedUsers} 
                    renderAction={(user) => (
                      <button 
                        onClick={() => handleUnblock(user._id)}
                        className="px-4 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors"
                      >
                        Unblock
                      </button>
                    )}
                  />
                ) : (
                  <div className="text-center py-20 text-gray-500">
                    <p>Your block list is empty.</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

export { Settings };
