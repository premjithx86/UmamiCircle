import { render, screen } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Chat } from './Chat';
import api from '../services/api';

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    userData: { _id: 'u1', username: 'testuser' },
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

describe('Chat Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both conversation list and chat window', async () => {
    api.get.mockResolvedValue({ data: [] });

    render(<Chat />);
    
    expect(screen.getByRole('heading', { name: /Messages/i })).toBeInTheDocument();
    expect(await screen.findByText(/Your Kitchen Chat/i)).toBeInTheDocument();
  });
});
