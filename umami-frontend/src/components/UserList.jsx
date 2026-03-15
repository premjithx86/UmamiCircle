import React from 'react';
import { Button } from './Button';
import { Avatar } from './Avatar';

const UserList = ({ users = [], onFollowToggle, renderAction, emptyMessage = "No users found." }) => {
  if (users.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
      {users.map((user) => (
        <li key={user._id} className="py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar user={user} size="md" />
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                @{user.username}
              </p>
            </div>
          </div>
          
          {renderAction ? renderAction(user) : (
            <Button
              variant={user.isFollowing ? 'secondary' : 'primary'}
              className="text-xs py-1.5 px-3"
              onClick={() => onFollowToggle && onFollowToggle(user)}
            >
              {user.isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
};

export { UserList };
