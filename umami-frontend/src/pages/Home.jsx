import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import api from '../services/api';
import { PostCard } from '../components/PostCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ShareModal } from '../components/ShareModal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Home as HomeIcon, RefreshCw } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const fetchFeed = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/following?page=${pageNum}&limit=12`);
      const newPosts = response.data;
      
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      if (newPosts.length < 12) {
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

  const handleShare = (post) => {
    setSelectedPost(post);
    setIsShareModalOpen(true);
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 md:px-0 space-y-8">
      <SEO 
        title="Home" 
        description="Your UmamiCircle following feed."
      />
      
      <div className="space-y-8">
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.map(post => (
                <div key={post._id} className="flex justify-center">
                   <div className="w-full max-w-xl md:max-w-none">
                    <PostCard
                      post={post}
                      onShare={handleShare}
                      onDelete={handleDeletePost}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center py-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchFeed(next);
                  }}
                  disabled={loading}
                  className="rounded-full px-10 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : 'Load More Creations'}
                </Button>
              </div>
            )}
          </>
        ) : !loading ? (
          <div className="max-w-xl mx-auto">
            <Card className="text-center py-24 bg-card border-dashed border-2 border-border shadow-none rounded-[2rem]">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <HomeIcon size={40} />
              </div>
              <h2 className="text-2xl font-black text-foreground">Your feed is empty</h2>
              <p className="mt-3 text-muted-foreground max-w-xs mx-auto font-medium">
                Follow some amazing chefs to see their latest creations here!
              </p>
              <Button asChild className="mt-8 rounded-full px-8">
                <a href="/explore">Discover Chefs</a>
              </Button>
            </Card>
          </div>
        ) : null}

        {loading && page === 1 && (
          <div className="flex justify-center py-32">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto text-center py-20 bg-destructive/5 rounded-3xl border border-destructive/20">
            <p className="text-destructive font-bold">{error}</p>
            <Button 
              variant="ghost"
              onClick={() => fetchFeed(page)}
              className="mt-4 text-primary hover:bg-primary/10 hover:text-primary"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
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
