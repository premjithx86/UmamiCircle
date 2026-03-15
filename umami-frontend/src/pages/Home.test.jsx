import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Home } from './Home';
import api from '../services/api';

describe('Home Page', () => {
  const mockPosts = [
    {
      _id: 'p1',
      user: { username: 'chef1', profilePicUrl: '' },
      imageUrl: 'https://via.placeholder.com/600',
      caption: 'Tasty pasta!',
      likes: [],
      isLiked: false,
    },
    {
      _id: 'p2',
      user: { username: 'chef2', profilePicUrl: '' },
      imageUrl: 'https://via.placeholder.com/600',
      caption: 'Best burger ever',
      likes: ['u1'],
      isLiked: true,
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders feed with posts', async () => {
    api.get.mockResolvedValue({ data: mockPosts });

    render(<Home />);

    // Wait for posts to load
    const post1 = await screen.findByText(/Tasty pasta!/i);
    expect(post1).toBeInTheDocument();
    expect(screen.getByText(/Best burger ever/i)).toBeInTheDocument();
    expect(screen.getAllByText(/chef1/i)[0]).toBeInTheDocument();
  });

  it('handles empty feed', async () => {
    api.get.mockResolvedValue({ data: [] });

    render(<Home />);

    const emptyMsg = await screen.findByText(/Your feed is empty/i);
    expect(emptyMsg).toBeInTheDocument();
  });

  it('handles error when fetching feed', async () => {
    api.get.mockRejectedValue(new Error('Failed to load feed'));

    render(<Home />);

    const errorMsg = await screen.findByText(/Failed to load feed/i);
    expect(errorMsg).toBeInTheDocument();
  });
});
