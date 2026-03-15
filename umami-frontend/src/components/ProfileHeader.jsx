import React from 'react';
import { Button } from './ui/Button';
import { ShieldAlert, Ban, MessageSquare, Edit3 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';
import { Card, CardContent } from './ui/Card';
import { getCloudinaryUrl } from '../utils/cloudinary';

const ProfileHeader = ({ user, isOwnProfile, isFollowing, isBlockedByMe, onFollowToggle, onEditProfile, onReport, onBlock, onMessage }) => {
  if (!user) return null;

  return (
    <Card className="border-border bg-card shadow-lg rounded-[2.5rem] overflow-hidden">
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-10">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-background shadow-xl ring-1 ring-border">
            <AvatarImage src={getCloudinaryUrl(user.profilePicUrl, 150, 150)} className="object-cover" />
            <AvatarFallback className="text-3xl bg-primary/10 text-primary font-black">
              {user.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info and Stats */}
        <div className="flex-1 flex flex-col space-y-4 text-center md:text-left min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h2 
                data-testid="profile-name"
                className="text-2xl md:text-3xl font-black text-foreground tracking-tight truncate"
              >
                {user.name}
              </h2>
              <p className="text-primary font-black text-sm uppercase tracking-widest opacity-80">
                @{user.username}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end items-center gap-2">
              {isOwnProfile ? (
                <Button variant="secondary" onClick={onEditProfile} className="rounded-xl px-5 py-2 h-9 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Edit3 size={14} />
                  Settings
                </Button>
              ) : (
                <>
                  <Button
                    variant={isFollowing ? 'secondary' : 'default'}
                    onClick={onFollowToggle}
                    className="rounded-xl px-6 h-9 text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  
                  <Button variant="outline" onClick={onMessage} className="rounded-xl px-4 h-9 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-border hover:bg-accent/10">
                    <MessageSquare size={14} />
                    <span>Message</span>
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={onReport} title="Report User" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl">
                      <ShieldAlert size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={onBlock} 
                      title={isBlockedByMe ? "Unblock User" : "Block User"}
                      className={`h-9 w-9 rounded-xl ${isBlockedByMe ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"}`}
                    >
                      <Ban size={18} />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats and Bio */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 pt-4 border-t border-border/50">
            <div className="flex justify-center md:justify-start gap-8">
              <div className="flex flex-col items-center md:items-start">
                <span data-testid="posts-count" className="text-lg font-black text-foreground leading-none">{user.postsCount || 0}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1.5">posts</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span data-testid="followers-count" className="text-lg font-black text-foreground leading-none">{user.followersCount || 0}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1.5">followers</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span data-testid="following-count" className="text-lg font-black text-foreground leading-none">{user.followingCount || 0}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1.5">following</span>
              </div>
            </div>

            {user.bio && (
              <p className="text-muted-foreground font-medium text-sm max-w-lg leading-relaxed italic border-l-2 border-primary/30 pl-4 py-0.5 md:ml-4">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { ProfileHeader };
