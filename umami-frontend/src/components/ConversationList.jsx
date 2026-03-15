import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';
import { Search, MessageSquare } from 'lucide-react';
import { Input } from './ui/Input';
import { ScrollArea } from './ui/ScrollArea';
import { Badge } from './ui/Badge';
import { cn } from '../utils/cn';
import { getCloudinaryUrl } from '../utils/cloudinary';

export const ConversationList = ({
  conversations = [],
  currentUserId,
  activeConversationId,
  onSelectConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p._id !== currentUserId);
    const name = (otherParticipant?.name || otherParticipant?.username || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-card/30" data-testid="conversation-list">
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors z-10" />
          <Input
            type="text"
            placeholder="Search chefs..."
            className="pl-10 bg-background/50 border-border rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(
                (p) => p._id !== currentUserId
              );
              const isActive = activeConversationId === conversation._id;
              const unreadCount = conversation.unreadCounts?.[currentUserId] || 0;
              const isUnread = unreadCount > 0;

              return (
                <button
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    "flex items-center space-x-3 w-full p-3 rounded-2xl text-left transition-all duration-200 group",
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-accent/5 text-foreground'
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                      <AvatarImage src={getCloudinaryUrl(otherParticipant?.profilePicUrl, 80, 80)} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary font-black">
                        {otherParticipant?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary border-2 border-background rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className={cn(
                        "text-sm truncate",
                        isUnread || isActive ? "font-black" : "font-bold text-foreground/80"
                      )}>
                        {otherParticipant?.name || otherParticipant?.username}
                      </h4>
                      {conversation.lastMessageAt && (
                        <span className={cn(
                          "text-[10px] uppercase font-black tracking-widest",
                          isUnread ? "text-primary" : "text-muted-foreground"
                        )}>
                          {new Date(conversation.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "text-xs truncate flex-1",
                        isUnread ? "text-foreground font-black" : "text-muted-foreground font-medium"
                      )}>
                        {conversation.lastMessage || 'Start a conversation'}
                      </p>
                      {isUnread && (
                        <Badge className="ml-2 bg-primary text-[10px] h-5 w-5 p-0 flex items-center justify-center font-black">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-20 text-center px-6">
              <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary/40">
                <MessageSquare size={32} />
              </div>
              <p className="text-muted-foreground text-sm font-black uppercase tracking-widest">
                {searchQuery ? "No matches found" : "No chats yet"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
