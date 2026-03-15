import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OptimizedImage } from './OptimizedImage';
import { Card, CardContent, CardFooter, CardHeader } from './ui/Card';
import { TagList } from './TagList';
import { EngagementBar } from './EngagementBar';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';
import { useSocialActions } from '../hooks/useSocialActions';
import { ContentActions } from './ContentActions';
import { EditContentModal } from './EditContentModal';
import { ReportModal } from './ReportModal';
import { ConfirmModal } from './common/ConfirmModal';
import { Badge } from './ui/Badge';
import { cn } from '../utils/cn';
import { getCloudinaryUrl } from '../utils/cloudinary';
import api from '../services/api';

/**
 * PostCard component for displaying a summary of a post or recipe in feeds.
 */
export const PostCard = ({ post, onShare, onDelete }) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [currentPost, setCurrentPost] = React.useState(post);

  if (!currentPost) return null;

  const isRecipe = !!currentPost.title || !!currentPost.ingredients;
  const targetType = isRecipe ? 'Recipe' : 'Post';
  const detailUrl = isRecipe ? `/recipes/${currentPost._id}` : `/posts/${currentPost._id}`;
  const displayName = currentPost.user?.name || currentPost.user?.username;
  const authorId = currentPost.user?._id || currentPost.user;

  const {
    isLiked,
    likesCount,
    isBookmarked,
    handleLikeToggle,
    handleBookmarkToggle,
  } = useSocialActions(targetType, currentPost);

  const handleCommentClick = () => {
    navigate(`${detailUrl}#comments`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const endpoint = isRecipe ? `/recipes/${currentPost._id}` : `/posts/${currentPost._id}`;
      await api.delete(endpoint);
      if (onDelete) onDelete(currentPost._id);
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete content');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = (updatedItem) => {
    setCurrentPost(prev => ({ ...prev, ...updatedItem }));
  };

  return (
    <Card className="overflow-hidden border-border bg-card group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-primary/30 rounded-[1.5rem] flex flex-col h-full">
      {/* Header */}
      <CardHeader className="p-4 flex flex-row items-center space-y-0 space-x-3 shrink-0">
        <Link to={`/u/${currentPost.user?.username}`} className="relative shrink-0">
          <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/50">
            <AvatarImage src={getCloudinaryUrl(currentPost.user?.profilePicUrl, 80, 80)} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
              {currentPost.user?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col flex-1 min-w-0">
          <Link to={`/u/${currentPost.user?.username}`} className="font-black text-sm text-foreground hover:text-primary transition-colors leading-none truncate tracking-tight">
            {displayName}
          </Link>
          <span className="text-[10px] text-secondary font-bold mt-1 truncate uppercase tracking-widest opacity-80">@{currentPost.user?.username}</span>
        </div>
        <ContentActions 
          authorId={authorId}
          onEdit={() => setIsEditModalOpen(true)}
          onDelete={() => setIsConfirmModalOpen(true)}
          onReport={() => setIsReportModalOpen(true)}
          className="ml-2 text-secondary hover:text-foreground transition-colors shrink-0"
        />
      </CardHeader>

      {/* Image Container */}
      <div className="relative overflow-hidden h-[200px] shrink-0 bg-muted">
        <Link to={detailUrl} className="block h-full w-full">
          <OptimizedImage
            src={currentPost.imageUrl}
            alt={currentPost.title || "Post content"}
            width={600}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>
        {isRecipe && (
          <Badge className="absolute top-3 right-3 bg-primary/90 text-primary-foreground border-none font-black text-[9px] uppercase tracking-tighter shadow-lg">
            Recipe
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 flex flex-col flex-1 min-h-0">
        <div className="flex-1 space-y-2">
          {isRecipe && (
            <h3 className="font-black text-base text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors duration-300 line-clamp-1">
              {currentPost.title}
            </h3>
          )}
          <p className="text-xs text-secondary font-medium leading-relaxed line-clamp-2">
            {isRecipe ? currentPost.description : currentPost.caption}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 shrink-0">
          <EngagementBar
            isLiked={isLiked}
            isBookmarked={isBookmarked}
            likesCount={likesCount}
            commentsCount={currentPost.commentsCount || 0}
            onLikeToggle={() => handleLikeToggle(currentPost._id)}
            onBookmarkToggle={() => handleBookmarkToggle(currentPost._id)}
            onShare={() => onShare(currentPost)}
            onCommentClick={handleCommentClick}
          />
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 border-t border-border/50 flex justify-between items-center bg-background/20 backdrop-blur-sm">
        <p className="text-[10px] text-secondary uppercase tracking-[0.2em] font-black">
          {new Date(currentPost.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </CardFooter>

      <EditContentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={currentPost}
        type={targetType}
        onUpdate={handleUpdate}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={currentPost._id}
        targetType={targetType}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${targetType}`}
        message={`Are you sure you want to delete this ${targetType.toLowerCase()}? This action cannot be undone and all comments will be removed.`}
        confirmLabel="Delete"
        loading={isDeleting}
        variant="destructive"
      />
    </Card>
  );
};
