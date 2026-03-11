import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConversationList } from './ConversationList';

describe('ConversationList Component', () => {
  const mockConversations = [
    {
      _id: 'c1',
      participants: [
        { _id: 'u1', username: 'user1', avatar: '' },
        { _id: 'u2', username: 'user2', avatar: '' },
      ],
      lastMessage: 'Hey there!',
      lastMessageAt: new Date().toISOString(),
    },
    {
      _id: 'c2',
      participants: [
        { _id: 'u1', username: 'user1', avatar: '' },
        { _id: 'u3', username: 'user3', avatar: '' },
      ],
      lastMessage: 'See you later',
      lastMessageAt: new Date().toISOString(),
    },
  ];

  it('renders a list of conversations correctly', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        currentUserId="u1"
        onSelectConversation={() => {}}
      />
    );

    expect(screen.getByText('user2')).toBeInTheDocument();
    expect(screen.getByText('user3')).toBeInTheDocument();
    expect(screen.getByText('Hey there!')).toBeInTheDocument();
    expect(screen.getByText('See you later')).toBeInTheDocument();
  });

  it('calls onSelectConversation when a conversation is clicked', () => {
    const onSelectConversation = vi.fn();
    render(
      <ConversationList
        conversations={mockConversations}
        currentUserId="u1"
        onSelectConversation={onSelectConversation}
      />
    );

    fireEvent.click(screen.getByText('user2').closest('button'));
    expect(onSelectConversation).toHaveBeenCalledWith(mockConversations[0]);
  });

  it('highlights the active conversation', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        currentUserId="u1"
        activeConversationId="c1"
        onSelectConversation={() => {}}
      />
    );

    const activeItem = screen.getByText('user2').closest('button');
    expect(activeItem).toHaveClass('bg-orange-50'); // Assuming this is the active style
  });

  it('renders empty message when no conversations', () => {
    render(<ConversationList conversations={[]} onSelectConversation={() => {}} />);
    expect(screen.getByText(/No conversations yet/i)).toBeInTheDocument();
  });
});
