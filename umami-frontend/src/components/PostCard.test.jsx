import { render, screen } from '../test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { PostCard } from './PostCard';

// Mock useSocialActions
vi.mock('../hooks/useSocialActions', () => ({
  useSocialActions: () => ({
    isLiked: false,
    likesCount: 5,
    isBookmarked: false,
    handleLikeToggle: vi.fn(),
    handleBookmarkToggle: vi.fn(),
  }),
}));

describe('PostCard Component', () => {
  const mockPost = {
    _id: 'p1',
    user: { username: 'chef1', name: 'Master Chef', profilePicUrl: '' },
    imageUrl: 'https://via.placeholder.com/600',
    caption: 'Delicious meal!',
    tags: ['food'],
    createdAt: new Date().toISOString(),
    commentsCount: 3,
  };

  it('renders author information correctly (standard UI)', () => {
    render(<PostCard post={mockPost} onShare={() => {}} />);
    
    expect(screen.getAllByText('Master Chef')[0]).toBeInTheDocument();
    expect(screen.getByText(/@chef1/i)).toBeInTheDocument();
  });

  it('renders likes and comments count', () => {
    render(<PostCard post={mockPost} onShare={() => {}} />);

    expect(screen.getByTestId('likes-count')).toHaveTextContent(/5/);
    expect(screen.getByText('3')).toBeInTheDocument(); // comments count
  });
  it('identifies as a recipe when title is present', () => {
    const mockRecipe = { ...mockPost, title: 'Awesome Pasta' };
    render(<PostCard post={mockRecipe} onShare={() => {}} />);
    
    expect(screen.getByText(/Recipe/i)).toBeInTheDocument();
    expect(screen.getByText('Awesome Pasta')).toBeInTheDocument();
  });
});
