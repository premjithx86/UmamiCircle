import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Card } from '../components/Card';
import { TagList } from '../components/TagList';

export const PostDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Simulate API call with mock data
    setTimeout(() => {
      setPost({
        _id: id,
        user: {
          _id: 'u1',
          username: 'testuser',
          name: 'Test User',
          avatar: '',
        },
        imageUrl: 'https://via.placeholder.com/600',
        caption: 'Delicious food from today!',
        tags: ['food', 'delicious', 'yummy'],
        createdAt: new Date().toISOString(),
        likesCount: 24,
        commentsCount: 5,
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" data-testid="loading-spinner">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return <div className="text-center py-20 text-gray-500">Post not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500" data-testid="post-detail">
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-3/5 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="w-full h-auto max-h-[600px] object-contain"
            />
          </div>

          {/* Sidebar Section */}
          <div className="md:w-2/5 flex flex-col h-full max-h-[600px]">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <img
                src={post.user.avatar || 'https://via.placeholder.com/40'}
                alt={post.user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <Link to={`/u/${post.user.username}`} className="font-bold text-sm text-gray-900 dark:text-white hover:text-primary transition-colors">
                  {post.user.username}
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-400">{post.user.name}</span>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-start space-x-3">
                <img
                  src={post.user.avatar || 'https://via.placeholder.com/40'}
                  alt={post.user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-bold mr-2 text-gray-900 dark:text-white">{post.user.username}</span>
                    <span className="text-gray-700 dark:text-gray-300">{post.caption}</span>
                  </p>
                  <TagList tags={post.tags} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Placeholder for real comments */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 italic">Comments implementation coming in Phase 2...</p>
              </div>
            </div>

            {/* Engagement Bar Placeholder */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2" data-testid="engagement-bar-placeholder">
              <div className="flex space-x-4">
                <span className="text-xl">🤍</span>
                <span className="text-xl">💬</span>
                <span className="text-xl">🔗</span>
                <span className="text-xl ml-auto">🔖</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {post.likesCount} likes
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
