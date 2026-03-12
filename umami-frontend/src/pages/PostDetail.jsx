import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { OptimizedImage } from '../components/OptimizedImage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Card } from '../components/Card';
import { TagList } from '../components/TagList';
import { EngagementBar } from '../components/EngagementBar';
import { CommentSection } from '../components/CommentSection';
import { ShareModal } from '../components/ShareModal';

export const PostDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
        likes: Array(24).fill('u1'),
        isLiked: false,
        isBookmarked: false,
        comments: [
          { _id: 'c1', user: { username: 'foodie', avatar: '' }, content: 'Looks so good!', createdAt: new Date().toISOString() },
        ],
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

  const shareUrl = `${window.location.origin}/posts/${id}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500" data-testid="post-detail">
      <SEO 
        title={`Post by ${post.user.username}`}
        description={post.caption}
        image={post.imageUrl}
        type="article"
      />
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row h-full md:max-h-[700px]">
          {/* Image Section */}
          <div className="md:w-3/5 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-hidden">
            <OptimizedImage
              src={post.imageUrl}
              alt="Post image"
              width={1200}
              lazy={false}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Sidebar Section */}
          <div className="md:w-2/5 flex flex-col h-full overflow-hidden">
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

            {/* Content and Comments Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
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

              <CommentSection
                comments={post.comments}
                onAddComment={(content) => {
                  const newComment = {
                    _id: Date.now().toString(),
                    user: { username: 'testuser', avatar: '' },
                    content,
                    createdAt: new Date().toISOString()
                  };
                  setPost({ ...post, comments: [newComment, ...post.comments] });
                }}
              />
            </div>

            {/* Engagement Bar */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700" data-testid="engagement-bar-placeholder">
              <EngagementBar
                isLiked={post.isLiked}
                isBookmarked={post.isBookmarked}
                likesCount={post.likes.length}
                onLikeToggle={() => setPost({ 
                  ...post, 
                  isLiked: !post.isLiked,
                  likes: post.isLiked ? post.likes.slice(0, -1) : [...post.likes, 'u1']
                })}
                onShare={() => setIsShareModalOpen(true)}
                onBookmarkToggle={() => setPost({ ...post, isBookmarked: !post.isBookmarked })}
              />
            </div>
          </div>
        </div>
      </Card>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={shareUrl}
      />
    </div>
  );
};
