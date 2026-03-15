import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIChat } from './AIChat';
import api from '../services/api';

describe('AIChat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    api.get.mockImplementation((url) => {
      if (url.includes('/usage')) return Promise.resolve({ data: { messagesUsed: 0, messagesRemaining: 5 } });
      if (url.includes('/history')) return Promise.resolve({ data: [] });
      return Promise.reject(new Error('Not found'));
    });
  });

  it('renders welcome screen when no messages', async () => {
    render(<AIChat />);
    expect(screen.getByText(/Ready to cook/i)).toBeInTheDocument();
    expect(screen.getByText('5/5')).toBeInTheDocument();
  });

  it('sends a starter question and receives AI response', async () => {
    api.post.mockResolvedValueOnce({ 
      data: { 
        reply: "Here is a quick dinner idea.", 
        messagesUsed: 1, 
        messagesRemaining: 4,
        historyId: 'new-id'
      } 
    });

    render(<AIChat />);

    const starterBtn = screen.getByText(/Give me a quick 15-minute dinner idea/i);
    fireEvent.click(starterBtn);

    await waitFor(() => {
      expect(screen.getByText("Here is a quick dinner idea.")).toBeInTheDocument();
      expect(screen.getByText('4/5')).toBeInTheDocument();
    });
  });

  it('renders chat history in sidebar', async () => {
    const mockHistory = [
      { _id: 'h1', title: 'Pasta Recipe', date: new Date(), messageCount: 2 }
    ];
    api.get.mockImplementation((url) => {
      if (url.includes('/history')) return Promise.resolve({ data: mockHistory });
      if (url.includes('/usage')) return Promise.resolve({ data: { messagesUsed: 0, messagesRemaining: 5 } });
      return Promise.reject(new Error('Not found'));
    });

    render(<AIChat />);

    await waitFor(() => {
      expect(screen.getByText('Pasta Recipe')).toBeInTheDocument();
    });
  });

  it('loads a specific chat when clicked', async () => {
    const mockChat = {
      _id: 'h1',
      title: 'Pasta Recipe',
      messages: [
        { role: 'user', content: 'How to pasta?' },
        { role: 'ai', content: 'Boil water.' }
      ]
    };
    
    api.get.mockImplementation((url) => {
      if (url.includes('/history/h1')) return Promise.resolve({ data: mockChat });
      if (url.includes('/history')) return Promise.resolve({ data: [{ _id: 'h1', title: 'Pasta Recipe' }] });
      if (url.includes('/usage')) return Promise.resolve({ data: { messagesUsed: 0, messagesRemaining: 5 } });
      return Promise.reject(new Error('Not found'));
    });

    render(<AIChat />);

    const historyItem = await screen.findByText('Pasta Recipe');
    fireEvent.click(historyItem);

    await waitFor(() => {
      expect(screen.getByText('How to pasta?')).toBeInTheDocument();
      expect(screen.getByText('Boil water.')).toBeInTheDocument();
    });
  });
});
