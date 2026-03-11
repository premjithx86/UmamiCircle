import React from 'react';
import { Button } from './Button';

const ProfileHeader = ({ user, isOwnProfile, isFollowing, onFollowToggle, onEditProfile }) => {
  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Avatar */}
      <div className="relative">
        <img
          src={user.avatar || 'https://via.placeholder.com/150'}
          alt={`${user.username}'s avatar`}
          className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary/10 p-1"
        />
      </div>

      {/* Info and Stats */}
      <div className="flex-1 flex flex-col space-y-4 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {user.username}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {user.name}
            </p>
          </div>

          <div className="flex justify-center md:justify-end space-x-2">
            {isOwnProfile ? (
              <Button variant="secondary" onClick={onEditProfile}>
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={isFollowing ? 'secondary' : 'primary'}
                onClick={onFollowToggle}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center md:justify-start space-x-8 border-y md:border-none py-4 md:py-0 border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-1">
            <span className="font-bold text-gray-900 dark:text-white">{user.stats?.posts || 0}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm md:text-base">posts</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-1">
            <span className="font-bold text-gray-900 dark:text-white">{user.stats?.followers || 0}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm md:text-base">followers</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-1">
            <span className="font-bold text-gray-900 dark:text-white">{user.stats?.following || 0}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm md:text-base">following</span>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-gray-700 dark:text-gray-300 max-w-lg">
            {user.bio}
          </p>
        )}
      </div>
    </div>
  );
};

export { ProfileHeader };
