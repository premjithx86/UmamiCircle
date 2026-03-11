import React, { useState, useEffect } from 'react';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

export const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [typingUser, setTypingUser] = useState(null);

  // Mock Current User (Replace with actual Auth context later)
  const currentUserId = 'u1'; 

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('join', currentUserId);
    });

    newSocket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
      // Update last message in list
      setConversations((prev) => 
        prev.map(c => c._id === message.conversationId 
          ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt } 
          : c
        )
      );
    });

    newSocket.on('user_typing', ({ username }) => {
      setTypingUser(username);
    });

    newSocket.on('user_stopped_typing', () => {
      setTypingUser(null);
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (activeConversation && socket) {
      socket.emit('join_conversation', activeConversation._id);
      // Fetch messages for active conversation (Mock for now)
      setMessages([
        { _id: 'm1', sender: { _id: 'u2', username: 'chef_jane' }, content: 'Hi! Love your recipes.', createdAt: new Date().toISOString() }
      ]);
    }
  }, [activeConversation, socket]);

  // Mock Conversations List
  useEffect(() => {
    setConversations([
      {
        _id: 'c1',
        participants: [
          { _id: 'u1', username: 'testuser' },
          { _id: 'u2', username: 'chef_jane' },
        ],
        lastMessage: 'Hi! Love your recipes.',
        lastMessageAt: new Date().toISOString(),
      }
    ]);
  }, []);

  const handleSendMessage = (content) => {
    const message = {
      _id: Date.now().toString(),
      conversationId: activeConversation._id,
      sender: { _id: currentUserId, username: 'testuser' },
      content,
      createdAt: new Date().toISOString(),
    };
    
    // In real app, call API first, then emit
    setMessages((prev) => [...prev, message]);
    if (socket) {
      socket.emit('stop_typing', { conversationId: activeConversation._id, userId: currentUserId });
    }
  };

  const handleTyping = () => {
    if (socket && activeConversation) {
      socket.emit('typing', { 
        conversationId: activeConversation._id, 
        userId: currentUserId, 
        username: 'testuser' 
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-gray-900">
      <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
        </div>
        <ConversationList
          conversations={conversations}
          currentUserId={currentUserId}
          activeConversationId={activeConversation?._id}
          onSelectConversation={setActiveConversation}
        />
      </div>
      <div className="flex md:w-2/3 flex-col overflow-hidden">
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          typingUser={typingUser}
        />
      </div>
    </div>
  );
};
