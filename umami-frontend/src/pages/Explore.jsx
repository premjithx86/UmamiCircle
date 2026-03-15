import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import api from '../services/api';
import { PostCard } from '../components/PostCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ShareModal } from '../components/ShareModal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { RefreshCw, Compass, TrendingUp, Users, Hash, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCloudinaryUrl } from '../utils/cloudinary';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';

const Explore = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Sidebar states
  const [trendingTags, setTrendingTags] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trendingContent, setTrendingContent] = useState([]);
  
  // Filter state
  const [selectedTag, setSelectedTag] = useState(null);

  const fetchExploreFeed = async (pageNum = 1, tag = null) => {
    try {
      setLoading(true);
      let url = `/posts/explore?page=${pageNum}&limit=15`;
      if (tag) {
        // If tag is selected, use search endpoint filtered by tag
        url = `/posts/search?tags=${tag.replace('#', '')}`;
      }
      
      const response = await api.get(url);
      const newItems = response.data;
      
      if (pageNum === 1) {
        setItems(newItems);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
      
      if (newItems.length < 15 || tag) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load explore feed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSidebarData = async () => {
    try {
      const [tagsRes, usersRes, trendingRes] = await Promise.all([
        api.get('/posts/trending-tags'),
        api.get('/users/top-chefs'),
        api.get('/posts/trending')
      ]);
      setTrendingTags(tagsRes.data);
      setSuggestedUsers(usersRes.data);
      setTrendingContent(trendingRes.data);
    } catch (err) {
      console.error('Failed to fetch sidebar data', err);
    }
  };

  useEffect(() => {
    fetchExploreFeed(1, selectedTag);
  }, [selectedTag]);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const handleShare = (item) => {
    setSelectedItem(item);
    setIsShareModalOpen(true);
  };

  const handleDeleteItem = (itemId) => {
    setItems(prev => prev.filter(i => i._id !== itemId));
  };

  const handleTagClick = (tag) => {
    const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (selectedTag === formattedTag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(formattedTag);
    }
    setPage(1);
  };

  const handleFollowUser = async (userId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const user = suggestedUsers.find(u => u._id === userId);
      const endpoint = user.isFollowing ? `/social/unfollow/${userId}` : `/social/follow/${userId}`;
      await api.post(endpoint);
      
      setSuggestedUsers(prev => prev.map(u => 
        u._id === userId 
          ? { ...u, isFollowing: !u.isFollowing, followersCount: u.isFollowing ? u.followersCount - 1 : u.followersCount + 1 } 
          : u
      ));
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 md:px-0">
      <SEO 
        title={selectedTag ? `Explore ${selectedTag}` : "Explore"} 
        description="Discover the best recipes and food posts on UmamiCircle."
      />
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-primary pl-6 py-2">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3 italic uppercase">
                <Compass className="text-primary" size={32} />
                {selectedTag ? `Tag: ${selectedTag}` : 'Explore'}
              </h1>
              <p className="text-muted-foreground font-medium">
                {selectedTag 
                  ? `Showing top creations tagged with ${selectedTag}`
                  : 'Discover trending dishes and new inspirations from our global community.'
                }
              </p>
            </div>
            
            {selectedTag && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedTag(null)}
                className="rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest px-4"
              >
                <X size={14} className="mr-2" />
                Clear Filter
              </Button>
            )}
          </div>

          <div className="space-y-10">
            {items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {items.map(item => (
                  <div key={item._id} className="flex justify-center">
                    <div className="w-full max-w-xl">
                      <PostCard
                        post={item}
                        onShare={handleShare}
                        onDelete={handleDeleteItem}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && (
              <div className="text-center py-32 bg-card rounded-[2rem] border border-dashed border-border shadow-inner">
                <p className="text-muted-foreground font-bold">No creations found.</p>
                {selectedTag && (
                  <Button variant="link" onClick={() => setSelectedTag(null)} className="mt-2 text-primary font-black uppercase tracking-widest text-[10px]">
                    Discover something else
                  </Button>
                )}
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="md" />
              </div>
            )}

            {hasMore && !loading && !selectedTag && (
              <div className="flex justify-center py-10">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchExploreFeed(next, selectedTag);
                  }}
                  className="rounded-full px-10 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-primary/20"
                >
                  Show More Trends
                </Button>
              </div>
            )}

            {error && (
              <div className="text-center py-20 bg-destructive/5 rounded-3xl border border-destructive/20">
                <p className="text-destructive font-bold">{error}</p>
                <Button 
                  variant="ghost"
                  onClick={() => fetchExploreFeed(page, selectedTag)}
                  className="mt-4 text-primary hover:bg-primary/10"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 space-y-8">
          {/* Trending Tags */}
          <Card className="p-6 rounded-[2rem] border-border bg-card/50 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Hash className="text-primary" size={20} />
              <h2 className="font-black uppercase tracking-tight text-sm">Trending Tags</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTags.length > 0 ? trendingTags.map(({ tag, count }) => (
                <Badge 
                  key={tag} 
                  variant={selectedTag === `#${tag}` ? "default" : "secondary"}
                  onClick={() => handleTagClick(tag)}
                  className={cn(
                    "cursor-pointer transition-all px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider border-none",
                    selectedTag === `#${tag}` 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary"
                  )}
                >
                  #{tag}
                  <span className="ml-1.5 opacity-40 font-black">{count}</span>
                </Badge>
              )) : (
                <div className="w-full py-4 text-center opacity-20">
                   <p className="text-[10px] font-black uppercase tracking-widest italic">Simmering...</p>
                </div>
              )}
            </div>
          </Card>

          {/* Top Chefs */}
          <Card className="p-6 rounded-[2rem] border-border bg-card/50 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Users className="text-primary" size={20} />
              <h2 className="font-black uppercase tracking-tight text-sm">Top Chefs</h2>
            </div>
            <div className="space-y-5">
              {suggestedUsers.length > 0 ? suggestedUsers.map(user => (
                <div key={user._id} className="flex items-center justify-between group">
                  <Link to={`/u/${user.username}`} className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 border-2 border-background ring-1 ring-border group-hover:ring-primary/30 transition-all shadow-md">
                      <AvatarImage src={getCloudinaryUrl(user.profilePicUrl, 80, 80)} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-black truncate leading-none text-foreground group-hover:text-primary transition-colors">{user.name || user.username}</p>
                      <p className="text-[9px] text-muted-foreground font-bold mt-1.5 uppercase tracking-widest truncate opacity-60">
                        {user.followersCount || 0} Followers
                      </p>
                    </div>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleFollowUser(user._id)}
                    className={cn(
                      "h-8 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                      user.isFollowing 
                        ? "text-muted-foreground bg-muted hover:bg-destructive/10 hover:text-destructive" 
                        : "text-primary bg-primary/5 hover:bg-primary hover:text-white shadow-sm"
                    )}
                  >
                    {user.isFollowing ? 'Joined' : 'Follow'}
                  </Button>
                </div>
              )) : (
                <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest opacity-40 py-4 italic">Finding stars...</p>
              )}
            </div>
          </Card>

          {/* Must Watch (Trending Content) */}
          <Card className="p-6 rounded-[2rem] border-border bg-card/50 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-primary" size={20} />
              <h2 className="font-black uppercase tracking-tight text-sm">Must Watch</h2>
            </div>
            <div className="space-y-5">
              {trendingContent.length > 0 ? trendingContent.map(item => (
                <Link key={item._id} to={item.type === 'recipe' ? `/recipes/${item._id}` : `/posts/${item._id}`} className="flex gap-4 group">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-border group-hover:border-primary/50 transition-all shadow-md relative">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {item.type === 'recipe' && (
                      <div className="absolute top-1 right-1 bg-primary/90 text-white p-1 rounded-lg">
                        <RefreshCw size={8} className="animate-spin-slow" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex flex-col justify-center space-y-1.5">
                    <p className="text-[10px] font-black line-clamp-2 leading-tight text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
                      {item.title || item.caption}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px] border-none bg-primary/5 text-primary font-black px-1.5 h-4">
                        {item.likesCount || 0} LIKES
                      </Badge>
                      <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40 italic">
                        {item.type}
                      </span>
                    </div>
                  </div>
                </Link>
              )) : (
                <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest opacity-40 py-4 italic">Gathering heat...</p>
              )}
            </div>
          </Card>
        </aside>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={selectedItem ? `${window.location.origin}/${selectedItem.title ? 'recipes' : 'posts'}/${selectedItem._id}` : ''}
      />
    </div>
  );
};

export { Explore };
