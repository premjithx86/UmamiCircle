import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatWindow } from './ChatWindow';

describe('ChatWindow Component', () => {
  const mockConversation = {
    _id: 'c1',
    participants: [
      { _id: 'u1', username: 'user1', avatar: '' },
      { _id: 'u2', username: 'user2', avatar: '' },
    ],
  };

  const mockMessages = [
    { _id: 'm1', sender: { _id: 'u1', username: 'user1' }, content: 'Hi!', createdAt: new Date().toISOString() },
    { _id: 'm2', sender: { _id: 'u2', username: 'user2' }, content: 'Hello there', createdAt: new Date().toISOString() },
  ];

  it('renders messages correctly', () => {
    render(
      <ChatWindow
        conversation={mockConversation}
        messages={mockMessages}
        currentUserId="u1"
        onSendMessage={() => {}}
      />
    );

    expect(screen.getByText('Hi!')).toBeInTheDocument();
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.getAllByText('user2').length).toBeGreaterThan(0);
  });

  it('calls onSendMessage when message is sent', () => {
    const onSendMessage = vi.fn();
    render(
      <ChatWindow
        conversation={mockConversation}
        messages={mockMessages}
        currentUserId="u1"
        onSendMessage={onSendMessage}
      />
    );

    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'Test reply' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    expect(onSendMessage).toHaveBeenCalledWith('Test reply');
  });

  it('shows typing indicator when user is typing', () => {
    render(
      <ChatWindow
        conversation={mockConversation}
        messages={mockMessages}
        currentUserId="u1"
        onSendMessage={() => {}}
        typingUser="user2"
      />
    );

    expect(screen.getByText(/user2 is typing/i)).toBeInTheDocument();
  });
});
