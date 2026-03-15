import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Link } from 'react-router-dom';
import { AlertCircle, MoreVertical, Trash2, Check, CheckCheck, Image as ImageIcon, Smile, Send, X, Loader2, User, MessageSquare } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import { cn } from '../utils/cn';
import { getCloudinaryUrl } from '../utils/cloudinary';
import api from '../services/api';

const COMMON_EMOJIS = ['😊', '😂', '❤️', '🔥', '👏', '🙌', '🍔', '🍕', '🍳', '👨‍🍳', '👩‍🍳', '😋', '✨', '💯', '📍', '📍'];

export const ChatWindow = ({
  conversation,
  messages = [],
  currentUserId,
  onSendMessage,
  onTyping,
  typingUser,
  onBlockUser,
  onUnblockUser,
  onDeleteMessage,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef();
  const emojiRef = useRef();
  const fileInputRef = useRef();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUser]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || conversation?.isBlocked) return;
    onSendMessage(newMessage);
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (onTyping) onTyping();
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onSendMessage(`IMAGE:${response.data.imageUrl}`);
    } catch (err) {
      console.error('Image upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const otherParticipant = conversation?.participants.find(p => p._id !== currentUserId);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background/50" data-testid="chat-window">
        <div className="text-center animate-in fade-in zoom-in-95 duration-700">
          <div className="bg-primary/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/20">
            <MessageSquare size={48} />
          </div>
          <h3 className="text-2xl font-black text-foreground mb-2">Your Kitchen Chat</h3>
          <p className="text-muted-foreground font-medium max-w-xs mx-auto">Select a chef to start swapping recipes and tips.</p>
        </div>
      </div>
    );
  }

  const isBlockedByMe = conversation.isBlocked && conversation.blockType === 'you_blocked';

  return (
    <div className="flex flex-col h-full bg-background" data-testid="chat-window">
      {/* Header */}
      <header className="p-4 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border border-border shadow-sm">
            <AvatarImage src={getCloudinaryUrl(otherParticipant?.profilePicUrl, 80, 80)} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-black">
              {otherParticipant?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Link to={`/u/${otherParticipant?.username}`} className="font-black text-foreground hover:text-primary transition-colors leading-none">
              {otherParticipant?.name || otherParticipant?.username}
            </Link>
            <span className="text-[10px] text-muted-foreground mt-1 font-black uppercase tracking-widest">@{otherParticipant?.username}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full">
              <MoreVertical size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to={`/u/${otherParticipant?.username}`} className="cursor-pointer font-bold">
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isBlockedByMe ? (
              <DropdownMenuItem 
                onClick={() => onUnblockUser(otherParticipant._id)}
                className="font-bold text-primary cursor-pointer"
              >
                <Check className="mr-2 h-4 w-4" />
                <span>Unblock User</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => onBlockUser(otherParticipant._id)}
                className="font-bold text-destructive cursor-pointer"
              >
                <X className="mr-2 h-4 w-4" />
                <span>Block User</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-background/30"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
            <div className="p-6 bg-muted rounded-full text-muted-foreground/50">
              <Smile size={48} />
            </div>
            <div>
              <p className="text-sm font-black text-foreground">No messages yet</p>
              <p className="text-xs font-bold text-muted-foreground">Start the conversation with a "Hi!"</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.sender?._id === currentUserId;
            const isImage = msg.content?.startsWith('IMAGE:');
            const imageUrl = isImage ? msg.content.substring(6) : null;
            
            const showDate = index === 0 || 
              new Date(messages[index-1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

            return (
              <React.Fragment key={msg._id}>
                {showDate && (
                  <div className="flex justify-center my-6">
                    <span className="px-4 py-1 bg-muted/50 rounded-full text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] border border-border/50">
                      {new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
                <div className={cn(
                  "flex group animate-in slide-in-from-bottom-2 duration-300",
                  isOwn ? "justify-end" : "justify-start"
                )}>
                  {!isOwn && (
                    <Avatar className="h-8 w-8 mr-3 self-end mb-1 border border-border shadow-sm">
                      <AvatarImage src={getCloudinaryUrl(msg.sender?.profilePicUrl, 80, 80)} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                        {msg.sender?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    "flex flex-col max-w-[75%]",
                    isOwn ? "items-end" : "items-start"
                  )}>
                    <div className="flex items-center gap-2 group/msg">
                      {isOwn && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteMessage(msg._id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-full"
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                      <div
                        className={cn(
                          "relative px-5 py-3 rounded-2xl text-sm shadow-sm",
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-tr-none font-bold'
                            : 'bg-card text-foreground rounded-tl-none border border-border font-medium'
                        )}
                      >
                        {isImage ? (
                          <div className="rounded-lg overflow-hidden -mx-1">
                            <img 
                              src={imageUrl} 
                              alt="Shared content" 
                              className="max-w-full max-h-80 object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(imageUrl, '_blank')}
                            />
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                        )}
                        <div className={cn(
                          "flex items-center justify-end mt-1.5 space-x-1 opacity-60 text-[9px] font-black uppercase tracking-widest",
                          isOwn ? 'text-primary-foreground' : 'text-muted-foreground'
                        )}>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isOwn && (
                            msg.isRead ? <CheckCheck size={10} className="text-blue-300" /> : <Check size={10} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        {typingUser && !conversation.isBlocked && (
          <div className="flex justify-start items-center animate-in fade-in duration-300">
            <Avatar className="h-8 w-8 mr-3 self-end mb-1 border border-border shadow-sm">
              <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">
                {typingUser.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="bg-card text-primary text-[10px] font-black px-5 py-3 rounded-2xl rounded-tl-none border border-border shadow-sm flex items-center gap-2">
              <span className="flex space-x-1">
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
              <span className="uppercase tracking-widest">{typingUser} is cooking a reply...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <footer className="p-4 border-t border-border bg-card/50">
        {conversation.isBlocked ? (
          <div className="flex flex-col items-center justify-center p-8 bg-destructive/5 text-destructive rounded-3xl border border-destructive/20 space-y-4 shadow-inner">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertCircle size={32} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest">
                {isBlockedByMe 
                  ? "You have blocked this chef" 
                  : "Conversation restricted"}
              </p>
              <p className="text-xs font-bold opacity-70 mt-1">Messaging is disabled for this conversation.</p>
            </div>
            {isBlockedByMe && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onUnblockUser(otherParticipant._id)}
                className="rounded-full px-8 font-black uppercase tracking-widest text-[10px]"
              >
                Unblock to chat
              </Button>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto flex items-end gap-3">
            <div className="flex-1 relative group" ref={emojiRef}>
              <textarea
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message chef..."
                rows="1"
                className="w-full pl-5 pr-14 py-4 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none text-sm font-medium no-scrollbar shadow-inner"
                style={{ maxHeight: '150px' }}
                onInput={(e) => {
                  e.target.style.height = 'inherit';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-1">
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-4 p-3 bg-card rounded-2xl shadow-2xl border border-border grid grid-cols-4 gap-1 animate-in fade-in slide-in-from-bottom-4 duration-200 z-50">
                    {COMMON_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => addEmoji(emoji)}
                        className="p-2.5 hover:bg-accent/10 rounded-xl transition-all text-xl active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                <Button 
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={cn(
                    "h-10 w-10 transition-all rounded-full",
                    showEmojiPicker ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  )}
                >
                  <Smile size={22} />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pb-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current.click()}
                className="h-11 w-11 bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full shadow-sm transition-all"
                disabled={isUploading}
              >
                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={22} />}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                onClick={handleSubmit}
                disabled={!newMessage.trim() || isUploading}
                className="h-11 w-11 p-0 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};
