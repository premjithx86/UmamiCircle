import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileTabs } from '../components/ProfileTabs';
import { ContentGrid } from '../components/ContentGrid';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { EditProfileForm } from '../components/EditProfileForm';
import { BlockModal } from '../components/BlockModal';
import { ReportModal } from '../components/ReportModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { userData, currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [error, setError] = useState(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const isOwnProfile = userData?.username === username;

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch User Profile
      const userRes = await api.get(`/users/${username}`);
      const profileUser = userRes.data;

      // 2. Fetch Content (Posts and Recipes)
      const [postsRes, recipesRes] = await Promise.all([
        api.get(`/posts/user/${profileUser._id}`),
        api.get(`/recipes/user/${profileUser._id}`)
      ]);
      
      setPosts(postsRes.data);
      setRecipes(recipesRes.data);
      
      // Set user data with correct counts at once
      setUser({
        ...profileUser,
        postsCount: postsRes.data.length,
        recipesCount: recipesRes.data.length
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.response?.status === 404) {
        setError('User not found');
      } else if (err.response?.status === 403 || err.response?.data?.error === 'This profile is not available') {
        setError('This profile is not available');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfileData();
    }
  }, [username, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const endpoint = user.isFollowing 
        ? `/social/unfollow/${user._id}` 
        : `/social/follow/${user._id}`;
      
      await api.post(endpoint);
      
      // Optimistic update
      setUser(prev => ({
        ...prev,
        isFollowing: !prev.isFollowing,
        followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
      }));
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleBlockToggle = async () => {
    try {
      const response = await api.post(`/social/block/${user._id}`);
      const isBlocked = response.data.isBlocked;
      
      setUser(prev => ({
        ...prev,
        isBlockedByMe: isBlocked
      }));
      
      setIsBlockModalOpen(false);
      
      // If we just blocked them, we might want to redirect if the backend enforces visibility
      if (isBlocked) {
        // Option 1: navigate('/'); 
        // Option 2: Just let the UI update (header will show Unblock)
      }
    } catch (err) {
      console.error('Block error:', err);
      alert('Failed to update block status');
    }
  };

  const handleMessage = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      // Create or get conversation
      const response = await api.post('/messages/conversations', {
        participantId: user._id
      });
      
      // Navigate to chat with this user context
      navigate('/messages', { 
        state: { 
          selectedConversation: response.data,
          selectedUser: {
            _id: user._id,
            username: user.username,
            name: user.name
          }
        } 
      });
    } catch (err) {
      console.error('Message error:', err);
      alert(err.response?.data?.error || 'Failed to start conversation');
    }
  };

  const handleProfileUpdate = async (formData) => {
    try {
      // Logic for update is in Settings now but we can keep a bridge or redirect
      setIsEditModalOpen(false);
      fetchProfileData();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <div className="text-6xl">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{error}</h2>
        <p className="text-gray-500">The profile you're looking for might be private or restricted.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 text-orange-600 font-bold hover:underline"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'posts', label: 'Posts', count: posts.length },
    { id: 'recipes', label: 'Recipes', count: recipes.length },
    { id: 'bookmarks', label: 'Bookmarks', hidden: !isOwnProfile },
  ].filter(t => !t.hidden);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SEO 
        title={`${user.name} (@${user.username})`}
        description={user.bio || `Check out ${user.username}'s profile on UmamiCircle`}
        image={user.profilePicUrl}
        type="profile"
      />
      
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        isFollowing={user.isFollowing}
        isBlockedByMe={user.isBlockedByMe}
        onFollowToggle={handleFollowToggle}
        onEditProfile={() => navigate('/settings')}
        onReport={() => setIsReportModalOpen(true)}
        onBlock={() => setIsBlockModalOpen(true)}
        onMessage={handleMessage}
      />

      <div className="w-full h-px bg-border/50" />

      <div className="space-y-6">
        <ProfileTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'posts' && (
          <ContentGrid
            items={posts}
            emptyMessage={isOwnProfile ? "You haven't shared any posts yet." : "This user hasn't shared any posts yet."}
          />
        )}

        {activeTab === 'recipes' && (
          <ContentGrid
            items={recipes}
            emptyMessage={isOwnProfile ? "You haven't shared any recipes yet." : "This user hasn't shared any recipes yet."}
          />
        )}

        {activeTab === 'bookmarks' && isOwnProfile && (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <p className="text-gray-500">Manage your bookmarks in <button onClick={() => navigate('/settings')} className="text-orange-600 font-bold hover:underline">Settings</button>.</p>
          </div>
        )}
      </div>

      {/* Block Modal */}
      <BlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={handleBlockToggle}
        username={user.username}
        isBlocking={!user.isBlockedByMe}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={user._id}
        targetType="User"
      />
    </div>
  );
};

export { Profile };
