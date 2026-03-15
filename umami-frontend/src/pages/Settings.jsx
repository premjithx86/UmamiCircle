import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { UserList } from '../components/UserList';
import { ContentGrid } from '../components/ContentGrid';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EditProfileForm } from '../components/EditProfileForm';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Settings as SettingsIcon, Shield, Bookmark, User as UserIcon, LogOut, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ type: '', message: '' });
  const [userToUnblock, setUserToUnblock] = useState(null);
  
  const { userData, logout, syncUserWithBackend } = useAuth();
  const navigate = useNavigate();

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
      const response = await api.get('/users/bookmarks');
      const { posts, recipes } = response.data;
      setBookmarks([...posts, ...recipes]);
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
      setUserToUnblock(null);
    } catch (err) {
      alert('Failed to unblock user');
    }
  };

  const handleProfileUpdate = async (formData) => {
    try {
      setUpdateStatus({ type: 'loading', message: 'Updating profile...' });
      await api.put('/users/me', formData);
      await syncUserWithBackend();
      setUpdateStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setUpdateStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setUpdateStatus({ 
        type: 'error', 
        message: err.response?.data?.error || 'Failed to update profile' 
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const menuItems = [
    { id: 'account', label: 'Edit Profile', icon: <UserIcon size={18} /> },
    { id: 'bookmarks', label: 'Bookmarks', icon: <Bookmark size={18} /> },
    { id: 'blocked', label: 'Privacy & Safety', icon: <Shield size={18} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <SEO title="Settings" description="Manage your UmamiCircle account settings." />
      
      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar */}
        <aside className="md:w-72 shrink-0 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center px-2">
              <SettingsIcon className="mr-3 text-primary" size={28} /> Settings
            </h1>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group",
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-black" 
                    : "text-muted-foreground hover:bg-accent/10 hover:text-foreground font-bold"
                )}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="uppercase tracking-widest text-[10px]">{item.label}</span>
                </div>
                <ChevronRight size={14} className={cn("transition-transform", activeTab === item.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100")} />
              </button>
            ))}

            <div className="pt-6 mt-6 border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-destructive font-black uppercase tracking-widest text-[10px] hover:bg-destructive/10 transition-all"
              >
                <LogOut size={18} />
                <span>Logout Session</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Card className="min-h-[600px] border-border bg-card shadow-2xl overflow-hidden">
            {activeTab === 'account' && (
              <div className="animate-in fade-in duration-500">
                <CardHeader className="p-8 border-b border-border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter italic">Edit Profile</CardTitle>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full">
                      @{userData?.username}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-8 space-y-8">
                  {updateStatus.message && (
                    <div className={cn(
                      "p-4 rounded-2xl flex items-center gap-3 text-sm font-black border animate-in slide-in-from-top-2",
                      updateStatus.type === 'error' ? "bg-destructive/5 border-destructive/20 text-destructive" : 
                      updateStatus.type === 'success' ? "bg-green-500/5 border-green-500/20 text-green-500" :
                      "bg-primary/5 border-primary/20 text-primary"
                    )}>
                      {updateStatus.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                      {updateStatus.message}
                    </div>
                  )}

                  {userData ? (
                    <EditProfileForm 
                      user={userData} 
                      onSubmit={handleProfileUpdate}
                      onCancel={() => navigate(`/u/${userData.username}`)}
                    />
                  ) : (
                    <div className="flex justify-center py-20"><LoadingSpinner /></div>
                  )}
                </CardContent>
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="animate-in fade-in duration-500">
                <CardHeader className="p-8 border-b border-border bg-muted/20">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter italic">Saved Creations</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {loading ? (
                    <div className="flex justify-center py-20"><LoadingSpinner /></div>
                  ) : bookmarks.length > 0 ? (
                    <ContentGrid items={bookmarks} />
                  ) : (
                    <div className="text-center py-32 border-2 border-dashed border-border rounded-3xl">
                      <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary/20">
                        <Bookmark size={32} />
                      </div>
                      <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No bookmarks found</p>
                    </div>
                  )}
                </CardContent>
              </div>
            )}

            {activeTab === 'blocked' && (
              <div className="animate-in fade-in duration-500">
                <CardHeader className="p-8 border-b border-border bg-muted/20">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter italic">Privacy & Safety</CardTitle>
                  <p className="text-xs font-medium text-muted-foreground mt-2">Users you block will not be able to see your content or message you.</p>
                </CardHeader>
                <CardContent className="p-8">
                  {loading ? (
                    <div className="flex justify-center py-20"><LoadingSpinner /></div>
                  ) : blockedUsers.length > 0 ? (
                    <div className="space-y-4">
                      <UserList 
                        users={blockedUsers} 
                        renderAction={(user) => (
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUnblock(user._id)}
                            className="rounded-full px-6 font-black uppercase tracking-widest text-[10px]"
                          >
                            Unblock
                          </Button>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-32 border-2 border-dashed border-border rounded-3xl">
                      <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary/20">
                        <Shield size={32} />
                      </div>
                      <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Your block list is empty</p>
                    </div>
                  )}
                </CardContent>
              </div>
            )}
          </Card>
        </main>
      </div>

      <ConfirmModal
        isOpen={!!userToUnblock}
        onClose={() => setUserToUnblock(null)}
        onCancel={() => setUserToUnblock(null)}
        onConfirm={() => handleUnblock(userToUnblock._id)}
        title="Unblock User"
        message={`Are you sure you want to unblock ${userToUnblock?.name || userToUnblock?.username}? They will be able to see your content and message you again.`}
        confirmLabel="Unblock"
      />
    </div>
  );
};

export { Settings };
