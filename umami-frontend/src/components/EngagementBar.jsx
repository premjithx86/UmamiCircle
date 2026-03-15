import React from 'react';

export const EngagementBar = ({
  isLiked = false,
  isBookmarked = false,
  likesCount = 0,
  commentsCount = 0,
  onLikeToggle,
  onCommentClick,
  onShare,
  onBookmarkToggle,
}) => {
  return (
    <div className="flex flex-col space-y-2 py-2 border-t border-gray-100 dark:border-gray-800" data-testid="engagement-bar">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Like Button */}
          <button
            onClick={onLikeToggle}
            className={`flex items-center space-x-1 group transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-red-500'
            }`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-7 w-7 transition-transform duration-200 group-hover:scale-110 ${isLiked ? 'fill-current' : 'fill-none'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Comment Button */}
          <button
            onClick={onCommentClick}
            className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-primary group transition-colors"
            aria-label="Comment"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 transition-transform duration-200 group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {commentsCount > 0 && (
              <span className="text-sm font-bold">{commentsCount}</span>
            )}
          </button>

          {/* Share Button */}
          <button
            onClick={onShare}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-500 group transition-colors"
            aria-label="Share"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 transition-transform duration-200 group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={onBookmarkToggle}
          className={`group transition-colors ${
            isBookmarked ? 'text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-primary'
          }`}
          aria-label={isBookmarked ? 'Unbookmark' : 'Bookmark'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-7 w-7 transition-transform duration-200 group-hover:scale-110 ${isBookmarked ? 'fill-current' : 'fill-none'}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {likesCount > 0 && (
        <p className="text-sm font-bold text-gray-900 dark:text-white" data-testid="likes-count">
          {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
        </p>
      )}
    </div>
  );
};
