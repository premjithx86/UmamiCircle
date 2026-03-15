import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChevronLeft, MessageSquare } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

export const Chat = () => {
  const { userData } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = userData?._id;

  // Immediate selection from state on mount
  useEffect(() => {
    if (location.state?.selectedConversation) {
      setActiveConversation(location.state.selectedConversation);
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join', currentUserId);
    });

    newSocket.on('new_message', (message) => {
      if (activeConversation && message.conversationId === activeConversation._id) {
        setMessages((prev) => [...prev, message]);
        if (message.sender._id !== currentUserId) {
          api.put(`/messages/conversations/${message.conversationId}/read`);
        }
      }
      
      setConversations((prev) => 
        prev.map(c => {
          if (c._id === message.conversationId) {
            const isUnread = activeConversation?._id !== message.conversationId && message.sender._id !== currentUserId;
            const currentUnread = c.unreadCounts?.[currentUserId] || 0;
            return { 
              ...c, 
              lastMessage: message.content, 
              lastMessageAt: message.createdAt,
              unreadCounts: {
                ...c.unreadCounts,
                [currentUserId]: isUnread ? currentUnread + 1 : 0
              }
            };
          }
          return c;
        }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    });

    newSocket.on('user_typing', ({ username, conversationId }) => {
      if (activeConversation?._id === conversationId) {
        setTypingUser(username);
      }
    });

    newSocket.on('user_stopped_typing', ({ conversationId }) => {
      if (activeConversation?._id === conversationId) {
        setTypingUser(null);
      }
    });

    return () => newSocket.close();
  }, [currentUserId, activeConversation?._id]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await api.get('/messages/conversations');
        let fetchedConversations = response.data;
        
        if (location.state) {
          const { selectedConversation, selectedUser } = location.state;
          
          if (selectedConversation) {
            const exists = fetchedConversations.find(c => c._id === selectedConversation._id);
            if (exists) {
              setActiveConversation(exists);
            } else {
              fetchedConversations = [selectedConversation, ...fetchedConversations];
              setActiveConversation(selectedConversation);
            }
          } else if (selectedUser) {
            const exists = fetchedConversations.find(c => 
              c.participants.some(p => p._id === selectedUser._id)
            );
            if (exists) {
              setActiveConversation(exists);
            }
          }
        }
        
        setConversations(fetchedConversations);
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId, location.state]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return;
      
      try {
        if (socket) {
          socket.emit('join_conversation', activeConversation._id);
        }
        const response = await api.get(`/messages/${activeConversation._id}`);
        setMessages(response.data);
        api.put(`/messages/conversations/${activeConversation._id}/read`);
        
        setConversations(prev => prev.map(c => 
          c._id === activeConversation._id 
            ? { ...c, unreadCounts: { ...c.unreadCounts, [currentUserId]: 0 } } 
            : c
        ));
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [activeConversation?._id, socket, currentUserId]);

  const handleSendMessage = async (content) => {
    if (!activeConversation || !content.trim()) return;
    try {
      await api.post('/messages', {
        conversationId: activeConversation._id,
        content
      });
      if (socket) {
        socket.emit('stop_typing', { conversationId: activeConversation._id, userId: currentUserId });
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleTyping = () => {
    if (socket && activeConversation) {
      socket.emit('typing', { 
        conversationId: activeConversation._id, 
        userId: currentUserId, 
        username: userData.username 
      });
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      const response = await api.post(`/social/block/${userId}`);
      const isBlocked = response.data.isBlocked;
      setConversations(prev => prev.map(c => 
        c.participants.some(p => p._id.toString() === userId.toString()) 
          ? { ...c, isBlocked: isBlocked, blockType: isBlocked ? 'you_blocked' : null } 
          : c
      ));
      if (activeConversation && activeConversation.participants.some(p => p._id.toString() === userId.toString())) {
        setActiveConversation(prev => ({ ...prev, isBlocked: isBlocked, blockType: isBlocked ? 'you_blocked' : null }));
      }
    } catch (err) {
      console.error('Block error:', err);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await api.post(`/social/block/${userId}`);
      setConversations(prev => prev.map(c => 
        c.participants.some(p => p._id.toString() === userId.toString()) 
          ? { ...c, isBlocked: false, blockType: null } 
          : c
      ));
      if (activeConversation && activeConversation.participants.some(p => p._id.toString() === userId.toString())) {
        setActiveConversation(prev => ({ ...prev, isBlocked: false, blockType: null }));
      }
    } catch (err) {
      console.error('Unblock error:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m._id !== messageId));
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
      <div className={`${activeConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-border flex-col bg-card/50`}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <MessageSquare className="text-primary" size={24} />
            Messages
          </h2>
        </div>
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner /></div>
          ) : (
            <ConversationList
              conversations={conversations}
              currentUserId={currentUserId}
              activeConversationId={activeConversation?._id}
              onSelectConversation={setActiveConversation}
            />
          )}
        </div>
      </div>
      
      <div className={`${!activeConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden bg-background/30`}>
        {activeConversation && (
          <div className="md:hidden p-4 border-b border-border bg-card">
            <Button 
              variant="ghost" 
              onClick={() => setActiveConversation(null)}
              className="text-primary font-black hover:bg-primary/10 -ml-2"
            >
              <ChevronLeft className="mr-1" size={20} />
              Back
            </Button>
          </div>
        )}
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          typingUser={typingUser}
          onBlockUser={handleBlockUser}
          onUnblockUser={handleUnblockUser}
          onDeleteMessage={handleDeleteMessage}
        />
      </div>
    </div>
  );
};
