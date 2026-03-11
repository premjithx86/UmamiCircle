import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileTabs } from '../components/ProfileTabs';
import { ContentGrid } from '../components/ContentGrid';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { EditProfileForm } from '../components/EditProfileForm';
import { BlockModal } from '../components/BlockModal';
import { ReportForm } from '../components/ReportForm';

const Profile = () => {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Mock data fetching
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser({
        _id: 'user123',
        username: username,
        name: 'John Doe',
        avatar: '',
        bio: 'Culinary explorer and food photographer.',
        stats: {
          posts: 12,
          followers: 450,
          following: 180,
        },
        isFollowing: false,
      });
      setLoading(false);
    }, 500);
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" data-testid="loading-spinner">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-20 text-gray-500">User not found.</div>;
  }

  const tabs = [
    { id: 'posts', label: 'Posts', count: user.stats.posts },
    { id: 'recipes', label: 'Recipes', count: 5 }, // Mock count
    { id: 'bookmarks', label: 'Bookmarks' },
  ];

  const mockItems = [
    { _id: '1', imageUrl: 'https://via.placeholder.com/300', title: 'Delicious Pasta' },
    { _id: '2', imageUrl: 'https://via.placeholder.com/300', title: 'Summer Salad' },
    { _id: '3', imageUrl: 'https://via.placeholder.com/300', title: 'Classic Burger' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ProfileHeader
        user={user}
        isOwnProfile={username === 'testuser'} // Mock own profile check
        isFollowing={user.isFollowing}
        onFollowToggle={() => setUser({ ...user, isFollowing: !user.isFollowing })}
        onEditProfile={() => setIsEditModalOpen(true)}
      />

      <div className="space-y-6">
        <ProfileTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <ContentGrid
          items={activeTab === 'bookmarks' ? [] : mockItems}
          emptyMessage={`No ${activeTab} yet.`}
        />
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <EditProfileForm
          user={user}
          onSubmit={(data) => {
            setUser({ ...user, ...data });
            setIsEditModalOpen(false);
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Action triggers for Block/Report could be added to Header later */}
    </div>
  );
};

export { Profile };
