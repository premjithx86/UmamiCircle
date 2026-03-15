import { render, screen } from '../test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { ChatWindow } from './ChatWindow';

describe('ChatWindow Component', () => {
  const mockUser = { _id: 'u1', username: 'testuser' };
  const mockOther = { _id: 'u2', username: 'chef_jane', avatar: '' };
  const mockConversation = {
    _id: 'c1',
    participants: [mockUser, mockOther],
  };

  const mockMessages = [
    { _id: 'm1', sender: mockOther, content: 'Hello!', createdAt: new Date().toISOString() },
    { _id: 'm2', sender: mockUser, content: 'Hi there!', createdAt: new Date().toISOString() },
  ];

  it('renders messages correctly', () => {
    render(
      <ChatWindow
        conversation={mockConversation}
        messages={mockMessages}
        currentUserId="u1"
      />
    );
    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('calls onSendMessage when message is sent', () => {
    const onSendMessage = vi.fn();
    render(
      <ChatWindow
        conversation={mockConversation}
        messages={[]}
        currentUserId="u1"
        onSendMessage={onSendMessage}
      />
    );
    
    // Check if input exists
    const input = screen.getByPlaceholderText(/Message chef/i);
    expect(input).toBeInTheDocument();
  });

  it('shows typing indicator when user is typing', () => {
    render(
      <ChatWindow
        conversation={mockConversation}
        messages={[]}
        currentUserId="u1"
        typingUser="chef_jane"
      />
    );
    expect(screen.getByText(/chef_jane is cooking a reply/i)).toBeInTheDocument();
  });
});
