import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Settings } from './Settings';
import api from '../services/api';

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    userData: { 
      _id: 'user123', 
      username: 'testuser', 
      email: 'test@example.com',
      name: 'Test User',
      bio: 'Bio here'
    },
    logout: vi.fn(),
    syncUserWithBackend: vi.fn()
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user information correctly', () => {
    render(<Settings />);

    expect(screen.getByText(/@testuser/i)).toBeInTheDocument();
    // In the new EditProfileForm, inputs have values, not just text
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
  });

  it('switches tabs correctly', async () => {
    api.get.mockResolvedValue({ data: { posts: [], recipes: [] } });

    render(<Settings />);

    const bookmarksTab = screen.getByRole('button', { name: /Bookmarks/i });
    fireEvent.click(bookmarksTab);

    expect(screen.getByText(/Saved Creations/i)).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/users/bookmarks');

    const blockedTab = screen.getByRole('button', { name: /Privacy & Safety/i });
    fireEvent.click(blockedTab);

    expect(screen.getAllByText(/Privacy & Safety/i)[0]).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/social/blocked');
  });

  it('handles unblocking a user', async () => {
    api.get.mockResolvedValue({ data: [{ _id: 'u2', username: 'badguy' }] });
    api.post.mockResolvedValue({ success: true });

    render(<Settings />);

    const blockedTab = screen.getByRole('button', { name: /Privacy & Safety/i });
    fireEvent.click(blockedTab);

    const unblockBtn = await screen.findByRole('button', { name: /Unblock/i });
    fireEvent.click(unblockBtn);

    expect(api.post).toHaveBeenCalledWith('/social/unblock/u2');
  });
});
