import { render, screen, waitFor } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { Profile } from './Profile';
import api from '../services/api';

// Mock useAuth with stable references
const mockUserData = { _id: 'u1', username: 'testuser' };
const mockCurrentUser = { uid: 'uid1' };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    userData: mockUserData,
    currentUser: mockCurrentUser,
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Return a promise that doesn't resolve immediately
    api.get.mockReturnValue(new Promise(() => {}));
    
    render(
      <Routes>
        <Route path="/u/:username" element={<Profile />} />
      </Routes>,
      { route: '/u/testuser' }
    );
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders user profile and content', async () => {
    const mockUser = {
      _id: 'u1',
      username: 'testuser',
      name: 'Test User',
      bio: 'Chef life',
      postsCount: 5,
      followersCount: 10,
      followingCount: 20,
      isFollowing: false
    };

    api.get.mockImplementation((url) => {
      if (url.includes('/users/testuser')) return Promise.resolve({ data: mockUser });
      if (url.includes('/posts/user/')) return Promise.resolve({ data: [
        { _id: 'p1' }, { _id: 'p2' }, { _id: 'p3' }, { _id: 'p4' }, { _id: 'p5' }
      ] });
      if (url.includes('/recipes/user/')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} }); // Fallback instead of reject to avoid hanging
    });

    render(
      <Routes>
        <Route path="/u/:username" element={<Profile />} />
      </Routes>,
      { route: '/u/testuser' }
    );

    // More robust waiting
    const name = await screen.findByTestId('profile-name', {}, { timeout: 5000 });
    expect(name).toHaveTextContent(/Test User/i);
    expect(screen.getByTestId('posts-count')).toHaveTextContent('5');
    expect(screen.getByTestId('followers-count')).toHaveTextContent('10');
    expect(screen.getByTestId('following-count')).toHaveTextContent('20');
  });
});
