import React, { useState, useEffect, useRef } from 'react';
import { SEO } from '../components/SEO';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar';
import { Send, Sparkles, Loader2, AlertCircle, Plus, Trash2, Copy, Check, Clock, ChevronLeft, ChevronRight, Bot } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ScrollArea } from '../components/ui/ScrollArea';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { getCloudinaryUrl } from '../utils/cloudinary';
import { ConfirmModal } from '../components/common/ConfirmModal';

const STARTER_QUESTIONS = [
  "How do I make pasta from scratch?",
  "What spices go well with chicken?",
  "Give me a quick 15-minute dinner idea",
  "How do I know when oil is hot enough for frying?"
];

// Simple helper to render basic markdown-like content (bold and lists)
const MarkdownLite = ({ content }) => {
  const lines = content.split('\n');
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        // Bold
        let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Bullet points
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          return (
            <div key={i} className="flex items-start space-x-2 ml-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: processedLine.trim().substring(2) }} />
            </div>
          );
        }
        
        // Numbered lists
        if (/^\d+\./.test(line.trim())) {
          const match = line.trim().match(/^(\d+\.)\s+(.*)/);
          return (
            <div key={i} className="flex items-start space-x-2 ml-2">
              <span className="font-black text-primary shrink-0">{match[1]}</span>
              <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: match[2] }} />
            </div>
          );
        }

        if (line.trim() === '') return <div key={i} className="h-1" />;

        return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: processedLine }} />;
      })}
    </div>
  );
};

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ used: 0, remaining: 5 });
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  
  const { userData } = useAuth();
  const scrollRef = useRef();

  useEffect(() => {
    fetchUsage();
    fetchHistory();
    
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) setShowMobileChat(false);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, showMobileChat]);

  const fetchUsage = async () => {
    try {
      const response = await api.get('/ai/usage');
      setUsage({
        used: response.data.messagesUsed,
        remaining: response.data.messagesRemaining
      });
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/ai/history');
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const loadChat = async (id) => {
    try {
      setLoading(true);
      if (isMobileView) setShowMobileChat(true);
      const response = await api.get(`/ai/history/${id}`);
      setMessages(response.data.messages.map((m, idx) => ({ ...m, id: `${id}-${idx}` })));
      setActiveChatId(id);
      if (!isMobileView && window.innerWidth < 1024) setIsSidebarOpen(false);
    } catch (err) {
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
    setError(null);
    if (isMobileView) setShowMobileChat(true);
    else if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const deleteChat = async (id) => {
    try {
      await api.delete(`/ai/history/${id}`);
      setHistory(prev => prev.filter(h => h._id !== id));
      if (activeChatId === id) {
        startNewChat();
        if (isMobileView) setShowMobileChat(false);
      }
      setChatToDelete(null);
    } catch (err) {
      alert('Failed to delete chat');
    }
  };

  const handleSendMessage = async (userMessage) => {
    if (!userMessage.trim() || loading || usage.remaining <= 0) return;

    const msgText = userMessage.trim();
    setInput('');
    setError(null);
    
    const tempUserMsg = { id: Date.now().toString(), role: 'user', content: msgText, timestamp: new Date() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      setLoading(true);
      const response = await api.post('/ai/chat', { 
        message: msgText,
        historyId: activeChatId 
      });
      
      const aiReply = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: response.data.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiReply]);
      setUsage({
        used: response.data.messagesUsed,
        remaining: response.data.messagesRemaining
      });
      
      if (!activeChatId) {
        setActiveChatId(response.data.historyId);
        fetchHistory();
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      setError(err.response?.data?.error || 'UmamiBot is currently offline. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isLimitReached = usage.remaining <= 0;

  // Mobile History List View
  if (isMobileView && !showMobileChat) {
    return (
      <div className="flex flex-col h-[calc(100vh-160px)] bg-background">
        <header className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-lg z-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Sparkles size={16} />
              </div>
              <h1 className="text-sm font-black uppercase tracking-tight">UmamiBot</h1>
          </div>
          <Button 
            size="sm"
            onClick={startNewChat}
            className="rounded-full font-black text-[9px] uppercase tracking-widest px-4"
          >
            <Plus size={14} className="mr-1" />
            New Chat
          </Button>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {history.length > 0 ? (
              history.map((chat) => (
                <div 
                  key={chat._id}
                  onClick={() => loadChat(chat._id)}
                  className={cn(
                    "p-5 rounded-2xl bg-card border border-border flex items-center justify-between transition-all active:scale-[0.98]",
                    activeChatId === chat._id ? 'border-primary bg-primary/5' : ''
                  )}
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-xs font-black truncate uppercase tracking-tight">{chat.title}</p>
                    <p className="text-[9px] font-bold opacity-60 mt-1.5 uppercase tracking-widest">
                      {new Date(chat.date).toLocaleDateString()} • {chat.messageCount} messages
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => deleteChat(e, chat._id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-32 text-center opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest italic">No conversations yet</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Daily Quota</span>
            <span className="text-[9px] font-black text-primary">{usage.remaining}/5 left</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(usage.used / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex bg-card border border-border rounded-3xl overflow-hidden shadow-2xl relative">
      <SEO title="UmamiBot AI" description="Chat with our AI cooking assistant." />
      
      {/* Sidebar - Hidden on mobile */}
      {!isMobileView && (
        <aside className={cn(
          "transition-all duration-300 border-r border-border flex flex-col bg-card/50 overflow-hidden shrink-0",
          isSidebarOpen ? 'w-72' : 'w-0'
        )}>
          <div className="p-6 border-b border-border">
            <Button 
              onClick={startNewChat}
              className="w-full rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-primary/20"
            >
              <Plus size={16} className="mr-2" />
              New Session
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {history.length > 0 ? (
                history.map((chat) => (
                  <div 
                    key={chat._id}
                    onClick={() => loadChat(chat._id)}
                    className={cn(
                      "group relative p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between border border-transparent",
                      activeChatId === chat._id 
                        ? 'bg-primary/10 border-primary/20 text-primary shadow-inner' 
                        : 'hover:bg-accent/5 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-xs font-black truncate uppercase tracking-tight">{chat.title}</p>
                      <p className="text-[9px] font-bold opacity-60 mt-1 uppercase tracking-widest">
                        {new Date(chat.date).toLocaleDateString()} • {chat.messageCount} msgs
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => deleteChat(e, chat._id)}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full shrink-0 transition-all"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center opacity-20">
                  <p className="text-xs font-black uppercase tracking-widest italic">Kitchen empty</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 border-t border-border bg-background/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Daily Quota</span>
              <Badge variant={isLimitReached ? "destructive" : "secondary"} className="font-black text-[10px] border-none px-2">
                {usage.remaining}/5
              </Badge>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden shadow-inner">
              <div 
                className={cn(
                  "h-full transition-all duration-700",
                  isLimitReached ? 'bg-destructive' : 'bg-primary shadow-[0_0_10px_rgba(255,107,53,0.5)]'
                )}
                style={{ width: `${(usage.used / 5) * 100}%` }}
              />
            </div>
          </div>
        </aside>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/30">
        {/* Header */}
        <header className="p-4 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-md z-10">
          <div className="flex items-center space-x-4">
            {isMobileView ? (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowMobileChat(false)}
                className="rounded-full"
              >
                <ChevronLeft size={20} />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-muted-foreground hover:text-foreground rounded-full"
              >
                {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </Button>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Sparkles size={20} />
              </div>
              <div>
                <h1 className="text-sm font-black text-foreground uppercase tracking-tight leading-none">UmamiBot</h1>
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1.5">Chef de Cuisine AI</p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost"
            size="sm"
            onClick={startNewChat}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all rounded-full px-4"
          >
            Reset
          </Button>
        </header>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 md:space-y-10 no-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 md:space-y-10 max-w-lg mx-auto text-center px-4">
              <div className="p-6 md:p-8 bg-primary/10 rounded-full text-primary animate-pulse shadow-[0_0_30px_rgba(255,107,53,0.15)]">
                <Sparkles size={32} className="md:w-12 md:h-12" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tighter italic">Ready to cook?</h3>
                <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">I'm your culinary co-pilot. Ask me for recipes, techniques, or secret ingredient swaps.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {STARTER_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="p-4 md:p-5 text-[10px] md:text-xs font-black text-foreground bg-card border border-border rounded-2xl hover:border-primary hover:text-primary transition-all text-left shadow-sm active:scale-95 group"
                  >
                    <span className="flex items-center justify-between">
                      {q}
                      <Sparkles className="text-primary/0 group-hover:text-primary transition-all shrink-0 ml-2" size={14} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isAI = msg.role === 'ai';
                return (
                  <div key={msg.id} className={cn(
                    "flex group animate-in slide-in-from-bottom-4 duration-500",
                    isAI ? "justify-start" : "justify-end"
                  )}>
                    <div className={cn(
                      "flex items-start max-w-[90%] md:max-w-[85%] gap-2 md:gap-4",
                      isAI ? "flex-row" : "flex-row-reverse"
                    )}>
                      {isAI ? (
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 mt-1 shadow-lg shadow-primary/10 ring-2 ring-background">
                          <Bot size={16} className="md:w-[18px] md:h-[18px]" />
                        </div>
                      ) : (
                        <Avatar className="h-8 w-8 md:h-9 md:w-9 mt-1 shadow-md border-2 border-background ring-1 ring-border">
                          <AvatarImage src={getCloudinaryUrl(userData?.profilePicUrl, 80, 80)} className="object-cover" />
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                            {userData?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("space-y-2", isAI ? "items-start" : "items-end flex flex-col")}>
                        <div className={cn(
                          "relative px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl text-xs md:text-sm shadow-xl leading-relaxed group/msg",
                          isAI 
                            ? 'bg-card text-foreground rounded-tl-none border border-border font-medium' 
                            : 'bg-primary text-primary-foreground rounded-tr-none font-black'
                        )}>
                          {isAI ? <MarkdownLite content={msg.content} /> : msg.content}
                          
                          {isAI && (
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(msg.content, msg.id)}
                              className="absolute -right-10 md:-right-12 top-0 h-8 w-8 md:h-10 md:w-10 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-primary/5"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </Button>
                          )}
                        </div>
                        <div className={cn(
                          "flex items-center px-2 gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300",
                          isAI ? "justify-start" : "justify-end"
                        )}>
                          <Clock size={8} className="md:w-[10px] md:h-[10px]" />
                          <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          
          {loading && (
            <div className="flex justify-start items-center gap-2 md:gap-4">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-lg animate-pulse ring-2 ring-background">
                <Bot size={16} />
              </div>
              <div className="bg-card text-primary text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl rounded-tl-none border border-border shadow-md flex items-center gap-2 md:gap-3">
                <Loader2 size={12} className="animate-spin md:w-[14px] md:h-[14px]" />
                <span>Umami Chef is thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center pt-6">
              <div className="px-4 py-2 md:px-6 md:py-3 bg-destructive/5 text-destructive text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full border border-destructive/20 flex items-center animate-in zoom-in-95 shadow-inner">
                <AlertCircle size={14} className="mr-2 md:mr-3" />
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Input */}
        <footer className="p-4 md:p-6 border-t border-border bg-card/50">
          {isLimitReached ? (
            <div className="text-center py-4 md:py-5 px-6 md:px-8 bg-destructive/5 text-destructive text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-destructive/20 shadow-inner rounded-2xl">
              Daily quota reached. Return to the kitchen tomorrow!
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="flex items-center gap-3 md:gap-4 max-w-4xl mx-auto">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask UmamiBot anything..."
                  className="w-full pl-4 md:pl-6 pr-12 md:pr-16 py-4 md:py-5 rounded-xl md:rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-xs md:text-sm font-medium shadow-inner placeholder:text-muted-foreground/50"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                disabled={!input.trim() || loading}
                className="rounded-xl md:rounded-2xl h-12 w-12 md:h-[60px] md:w-[60px] p-0 shrink-0 shadow-xl shadow-primary/20 transition-all active:scale-90"
              >
                <Send size={20} className="md:w-6 md:h-6" />
              </Button>
            </form>
          )}
        </footer>
      </div>

      <ConfirmModal
        isOpen={!!chatToDelete}
        onClose={() => setChatToDelete(null)}
        onCancel={() => setChatToDelete(null)}
        onConfirm={() => deleteChat(chatToDelete)}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This will permanently remove all messages in this thread."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
};

export { AIChat };
