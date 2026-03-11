import React, { useState } from 'react';
import { Button } from './Button';

export const CommentSection = ({
  comments = [],
  onAddComment,
  onDeleteComment,
  currentUserId,
}) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  return (
    <div className="space-y-6" data-testid="comment-section">
      {/* Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-3"
        data-testid="comment-form"
      >
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
          rows="2"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newComment.trim()}
            className="text-sm py-1.5"
          >
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex space-x-3 group">
              <img
                src={comment.user.avatar || 'https://via.placeholder.com/32'}
                alt={comment.user.username}
                className="w-8 h-8 rounded-full object-cover mt-1"
              />
              <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-4 py-3 relative">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {comment.user.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {comment.content}
                </p>
                
                {onDeleteComment && (comment.user._id === currentUserId || true) && (
                  <button
                    onClick={() => onDeleteComment(comment._id)}
                    className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:underline transition-opacity"
                    aria-label="Delete comment"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
