import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';

export const ChatWindow = ({
  conversation,
  messages = [],
  currentUserId,
  onSendMessage,
  onTyping,
  typingUser,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (onTyping) onTyping();
  };

  const otherParticipant = conversation?.participants.find(p => p._id !== currentUserId);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
        <p className="text-gray-500">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900" data-testid="chat-window">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center space-x-3">
        <img
          src={otherParticipant?.avatar || 'https://via.placeholder.com/40'}
          alt={otherParticipant?.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">
            {otherParticipant?.username}
          </h3>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
      >
        {messages.map((msg) => {
          const isOwn = msg.sender._id === currentUserId;
          return (
            <div
              key={msg._id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  isOwn
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none'
                }`}
              >
                {!isOwn && (
                  <p className="text-[10px] font-bold mb-1 opacity-70">
                    {msg.sender.username}
                  </p>
                )}
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 text-right opacity-50`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        {typingUser && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs px-4 py-2 rounded-2xl rounded-tl-none italic">
              {typingUser} is typing...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="rounded-full !px-6 py-2"
            aria-label="Send"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};
