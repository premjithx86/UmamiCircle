import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Chat } from './Chat';

describe('Chat Page', () => {
  it('renders both conversation list and chat window', () => {
    // Mock window width to be large enough to show ChatWindow
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));

    render(
      <MemoryRouter>
        <Chat />
      </MemoryRouter>
    );

    expect(screen.getByTestId('conversation-list')).toBeInTheDocument();
    expect(screen.getByTestId('chat-window')).toBeInTheDocument();
  });
});
