import React from 'react';

export const ConversationList = ({
  conversations = [],
  currentUserId,
  activeConversationId,
  onSelectConversation,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-2">💬</p>
        <p className="text-sm">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto h-full" data-testid="conversation-list">
      {conversations.map((conversation) => {
        const otherParticipant = conversation.participants.find(
          (p) => p._id !== currentUserId
        );
        const isActive = activeConversationId === conversation._id;

        return (
          <button
            key={conversation._id}
            onClick={() => onSelectConversation(conversation)}
            className={`flex items-center space-x-3 w-full p-4 text-left border-b border-gray-100 dark:border-gray-800 transition-colors ${
              isActive
                ? 'bg-orange-50 dark:bg-orange-900/10'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <img
              src={otherParticipant?.avatar || 'https://via.placeholder.com/48'}
              alt={otherParticipant?.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {otherParticipant?.username}
                </h4>
                {conversation.lastMessageAt && (
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                    {new Date(conversation.lastMessageAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {conversation.lastMessage || 'Start a conversation'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
