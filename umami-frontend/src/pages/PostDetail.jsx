import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { OptimizedImage } from '../components/OptimizedImage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Card } from '../components/Card';
import { TagList } from '../components/TagList';
import { EngagementBar } from '../components/EngagementBar';
import { CommentSection } from '../components/CommentSection';
import { ShareModal } from '../components/ShareModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleLikeToggle = async () => {
    if (!post || !userData) return;
    try {
      const response = await api.post(`/posts/like/${post._id}`);
      const isLiked = !post.likes.includes(userData._id);
      setPost({
        ...post,
        isLiked,
        likes: isLiked 
          ? [...post.likes, userData._id] 
          : post.likes.filter(id => id !== userData._id)
      });
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" data-testid="loading-spinner">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">{error || "Post not found."}</p>
        <Link to="/" className="text-orange-600 font-bold hover:underline">Go back home</Link>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/posts/${id}`;
  const isLiked = userData ? post.likes.includes(userData._id) : false;

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
                src={post.user.profilePicUrl || 'https://via.placeholder.com/40'}
                alt={post.user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <Link to={`/u/${post.user.username}`} className="font-bold text-sm text-gray-900 dark:text-white hover:text-orange-600 transition-colors">
                  {post.user.username}
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-400">{post.user.name}</span>
              </div>
            </div>

            {/* Content and Comments Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
              <div className="flex items-start space-x-3">
                <img
                  src={post.user.profilePicUrl || 'https://via.placeholder.com/40'}
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

              {/* Placeholder for comments - will be fully implemented in Phase 4 */}
              <div className="text-center py-10 border-t border-gray-100 dark:border-gray-800">
                <p className="text-gray-400 text-sm italic">Comments coming soon in next update.</p>
              </div>
            </div>

            {/* Engagement Bar */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700" data-testid="engagement-bar-placeholder">
              <EngagementBar
                isLiked={isLiked}
                isBookmarked={false} // Will implement in next update
                likesCount={post.likes.length}
                onLikeToggle={handleLikeToggle}
                onShare={() => setIsShareModalOpen(true)}
                onBookmarkToggle={() => {}}
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
