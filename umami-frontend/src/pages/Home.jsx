import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import api from '../services/api';
import { PostCard } from '../components/PostCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ShareModal } from '../components/ShareModal';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPost, setSelectedReport] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const fetchFeed = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/following?page=${pageNum}&limit=10`);
      const newPosts = response.data;
      
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      if (newPosts.length < 10) {
        setHasMore(false);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load feed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const handleLikeToggle = async (postId) => {
    try {
      const response = await api.post(`/posts/like/${postId}`);
      setPosts(posts.map(p => {
        if (p._id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? [...p.likes, 'me'] : p.likes.slice(0, -1)
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Error toggling like', err);
    }
  };

  const handleBookmarkToggle = async (postId) => {
    // Bookmark implementation can be added in Phase 4
    setPosts(posts.map(p => p._id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p));
  };

  const handleShare = (post) => {
    setSelectedReport(post);
    setIsShareModalOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 md:px-0">
      <SEO 
        title="Home" 
        description="Your UmamiCircle following feed."
      />
      
      <div className="space-y-6">
        {posts.length > 0 ? (
          <>
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onLikeToggle={handleLikeToggle}
                onBookmarkToggle={handleBookmarkToggle}
                onShare={handleShare}
              />
            ))}
            
            {hasMore && (
              <div className="flex justify-center py-4">
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchFeed(next);
                  }}
                  disabled={loading}
                  className="px-6 py-2 rounded-full border border-orange-600 text-orange-600 font-bold hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : !loading ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <div className="text-5xl mb-4">🏠</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your feed is empty</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Follow some amazing chefs to see their latest creations here!
            </p>
          </div>
        ) : null}

        {loading && page === 1 && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => fetchFeed(page)}
              className="mt-4 text-orange-600 font-bold underline"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={selectedPost ? `${window.location.origin}/posts/${selectedPost._id}` : ''}
      />
    </div>
  );
};

export { Home };
