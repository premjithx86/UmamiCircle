import { render, screen, waitFor } from '../../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Home } from '../../pages/Home';
import { Explore } from '../../pages/Explore';
import { Profile } from '../../pages/Profile';
import { Route, Routes } from 'react-router-dom';
import api from '../../services/api';

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Logged out user can see discovery feed on Home', async () => {
    const mockPublicPosts = [
      { _id: 'p1', user: { username: 'chef1', profilePicUrl: '' }, imageUrl: 'url1', caption: 'Public Post' }
    ];
    
    // Mock API response for guest
    api.get.mockResolvedValue({ data: mockPublicPosts });

    render(<Home />);

    const post = await screen.findByText(/Public Post/i);
    expect(post).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/posts/following'));
  });

  it('Logged in user with no followers sees discover feed fallback', async () => {
    const mockDiscoverPosts = [
      { _id: 'd1', user: { username: 'trending', profilePicUrl: '' }, imageUrl: 'url2', caption: 'Trending Now' }
    ];
    
    api.get.mockResolvedValue({ data: mockDiscoverPosts });

    render(<Home />);

    const trendingPost = await screen.findByText(/Trending Now/i);
    expect(trendingPost).toBeInTheDocument();
  });

  it('User visits another profile and sees Message and Report buttons', async () => {
    const mockProfileUser = {
      _id: 'u2',
      username: 'targetuser',
      name: 'Target User',
      profilePicUrl: 'avatar-url',
      postsCount: 1,
      followersCount: 5,
      followingCount: 10,
      isFollowing: false
    };

    api.get.mockImplementation((url) => {
      if (url.includes('/users/targetuser')) return Promise.resolve({ data: mockProfileUser });
      if (url.includes('/posts/user/')) return Promise.resolve({ data: [] });
      if (url.includes('/recipes/user/')) return Promise.resolve({ data: [] });
      return Promise.reject(new Error('Not found'));
    });

    render(
      <Routes>
        <Route path="/u/:username" element={<Profile />} />
      </Routes>,
      { route: '/u/targetuser' }
    );

    // Check for buttons
    const messageBtn = await screen.findByRole('button', { name: /Message/i });
    expect(messageBtn).toBeInTheDocument();
    
    const reportBtn = screen.getByTitle(/Report User/i);
    expect(reportBtn).toBeInTheDocument();
    
    const blockBtn = screen.getByTitle(/Block User/i);
    expect(blockBtn).toBeInTheDocument();
  });
});
