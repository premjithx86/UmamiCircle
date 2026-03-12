import React from 'react';
import { Link } from 'react-router-dom';
import { OptimizedImage } from './OptimizedImage';
import { Card } from './Card';
import { TagList } from './TagList';
import { EngagementBar } from './EngagementBar';

/**
 * PostCard component for displaying a summary of a post in feeds.
 */
export const PostCard = ({ post, onLikeToggle, onBookmarkToggle, onShare }) => {
  if (!post) return null;

  return (
    <Card className="overflow-hidden mb-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-4 flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800">
        <Link to={`/u/${post.user.username}`}>
          <img
            src={post.user.profilePicUrl || 'https://via.placeholder.com/40'}
            alt={post.user.username}
            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
          />
        </Link>
        <Link to={`/u/${post.user.username}`} className="font-bold text-sm text-gray-900 dark:text-white hover:text-orange-600 transition-colors">
          {post.user.username}
        </Link>
      </div>

      {/* Image */}
      <Link to={`/posts/${post._id}`}>
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
          <OptimizedImage
            src={post.imageUrl}
            alt="Post content"
            width={600}
            height={600}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        <EngagementBar
          isLiked={post.isLiked}
          isBookmarked={post.isBookmarked}
          likesCount={post.likes?.length || 0}
          onLikeToggle={() => onLikeToggle(post._id)}
          onBookmarkToggle={() => onBookmarkToggle(post._id)}
          onShare={() => onShare(post)}
        />

        <div>
          <p className="text-sm">
            <Link to={`/u/${post.user.username}`} className="font-bold mr-2 text-gray-900 dark:text-white hover:text-orange-600 transition-colors">
              {post.user.username}
            </Link>
            <span className="text-gray-700 dark:text-gray-300">{post.caption}</span>
          </p>
        </div>

        <TagList tags={post.tags} />

        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
          {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
        </p>
      </div>
    </Card>
  );
};
