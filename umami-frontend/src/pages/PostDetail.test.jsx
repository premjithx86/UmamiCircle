import { render, screen, within } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { PostDetail } from './PostDetail';
import api from '../services/api';

// Mock useAuth directly
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    userData: { _id: 'user123', username: 'testuser', name: 'Test User' },
    currentUser: { uid: 'uid123' },
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

// Mock useSocialActions to return predictable counts for testing
vi.mock('../hooks/useSocialActions', () => ({
  useSocialActions: (type, item) => ({
    isLiked: item?.likes?.includes('user123') || false,
    likesCount: item?.likesCount ?? item?.likes?.length ?? 0,
    isBookmarked: false,
    handleLikeToggle: vi.fn(),
    handleBookmarkToggle: vi.fn(),
  })
}));

describe('PostDetail Page', () => {
  const mockPost = {
    _id: 'post123',
    user: {
      _id: 'u1',
      username: 'masterchef',
      name: 'Master Chef',
      profilePicUrl: 'https://via.placeholder.com/40',
    },
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947',
    caption: 'Delicious food from today!',
    tags: ['food', 'delicious'],
    createdAt: new Date().toISOString(),
    likes: ['user123'],
    likesCount: 1,
    commentsCount: 2,
  };

  const mockComments = [
    { _id: 'c1', content: 'Yum!', user: { username: 'user2', name: 'User Two' }, createdAt: new Date().toISOString() }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders post image and information correctly', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/posts/post123')) return Promise.resolve({ data: mockPost });
      if (url.includes('/comments/Post/')) return Promise.resolve({ data: mockComments });
      return Promise.reject(new Error('Not found'));
    });

    render(
      <Routes>
        <Route path="/posts/:id" element={<PostDetail />} />
      </Routes>,
      { route: '/posts/post123' }
    );

    // Wait for data to load
    const image = await screen.findByAltText(/Post image/i);
    expect(image).toBeInTheDocument();
    expect(screen.getAllByText(/Master Chef/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Delicious food from today!/i)).toBeInTheDocument();
  });

  it('renders engagement bar correctly', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/posts/post123')) return Promise.resolve({ data: mockPost });
      if (url.includes('/comments/Post/')) return Promise.resolve({ data: mockComments });
      return Promise.resolve({ data: [] });
    });

    render(
      <Routes>
        <Route path="/posts/:id" element={<PostDetail />} />
      </Routes>,
      { route: '/posts/post123' }
    );

    const postDetail = await screen.findByTestId('post-detail');
    // The EngagementBar is in the sidebar, after the content area
    const engagementBar = within(postDetail).getByTestId('engagement-bar');
    expect(engagementBar).toBeInTheDocument();
    
    const likesCount = within(engagementBar).getByTestId('likes-count');
    expect(likesCount).toHaveTextContent(/1\s+like/i);
  });

  it('handles error when post not found', async () => {
    api.get.mockRejectedValue(new Error('Post not found'));

    render(
      <Routes>
        <Route path="/posts/:id" element={<PostDetail />} />
      </Routes>,
      { route: '/posts/notfound' }
    );

    const errorMsg = await screen.findByText(/Failed to load post/i);
    expect(errorMsg).toBeInTheDocument();
  });
});
