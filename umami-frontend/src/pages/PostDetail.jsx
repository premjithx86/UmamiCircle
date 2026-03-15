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
import { ContentActions } from '../components/ContentActions';
import { EditContentModal } from '../components/EditContentModal';
import { ReportModal } from '../components/ReportModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Avatar } from '../components/Avatar';
import { useSocialActions } from '../hooks/useSocialActions';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const {
    isLiked,
    likesCount,
    isBookmarked,
    handleLikeToggle,
    handleBookmarkToggle,
  } = useSocialActions('Post', post);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        setLoading(true);
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/comments/Post/${id}`)
        ]);
        setPost(postRes.data);
        setComments(commentsRes.data);
        setError(null);
        
        // Handle scroll to comments if hash present
        if (window.location.hash === '#comments') {
          setTimeout(() => {
            const element = document.getElementById('comments');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500); // Wait for render
        }
      } catch (err) {
        console.error("Error fetching post details:", err);
        setError("Failed to load post. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPostAndComments();
    }
  }, [id]);

  const handleAddComment = async (content) => {
    try {
      const response = await api.post('/comments', {
        content,
        targetType: 'Post',
        targetId: id
      });
      // Add user context for immediate display
      const newComment = {
        ...response.data,
        user: userData
      };
      setComments([newComment, ...comments]);
      setPost(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
    } catch (err) {
      console.error('Add comment error:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      setPost(prev => ({ ...prev, commentsCount: Math.max(0, (prev.commentsCount || 0) - 1) }));
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/posts/${post._id}`);
      setIsConfirmModalOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = (updatedItem) => {
    setPost(prev => ({ ...prev, ...updatedItem }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
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
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar user={post.user} size="sm" />
                <div className="flex flex-col">
                  <Link to={`/u/${post.user.username}`} className="font-bold text-sm text-gray-900 dark:text-white hover:text-orange-600 transition-colors">
                    {post.user.name || post.user.username}
                  </Link>
                  <span className="text-xs text-gray-500 dark:text-gray-400">@{post.user.username}</span>
                </div>
              </div>
              <ContentActions 
                authorId={post.user?._id || post.user}
                onEdit={() => setIsEditModalOpen(true)}
                onDelete={() => setIsConfirmModalOpen(true)}
                onReport={() => setIsReportModalOpen(true)}
              />
            </div>

            {/* Content and Comments Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
              <div className="flex items-start space-x-3">
                <Avatar user={post.user} size="sm" />
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <p className="text-sm">
                      <span className="font-bold mr-2 text-gray-900 dark:text-white">
                        {post.user.name || post.user.username}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{post.caption}</span>
                    </p>
                    <span className="text-[10px] text-gray-500">@{post.user.username}</span>
                  </div>
                  <TagList tags={post.tags} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div id="comments" className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Comments</h3>
                <CommentSection
                  comments={comments}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  currentUserId={userData?._id}
                />
              </div>
            </div>

            {/* Engagement Bar */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700" data-testid="engagement-bar-placeholder">
              <div className="flex items-center justify-between mb-2">
                <EngagementBar
                  isLiked={isLiked}
                  isBookmarked={isBookmarked}
                  likesCount={likesCount}
                  commentsCount={post.commentsCount || comments.length}
                  onLikeToggle={() => handleLikeToggle(post._id)}
                  onBookmarkToggle={() => handleBookmarkToggle(post._id)}
                  onShare={() => setIsShareModalOpen(true)}
                  onCommentClick={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <EditContentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={post}
        type="Post"
        onUpdate={handleUpdate}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={shareUrl}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={post._id}
        targetType="Post"
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone and all associated comments will be removed."
        confirmLabel="Delete"
        loading={isDeleting}
        variant="destructive"
      />
    </div>
  );
};
