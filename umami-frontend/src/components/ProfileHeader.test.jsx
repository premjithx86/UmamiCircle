import { render, screen, fireEvent } from '../test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { ProfileHeader } from './ProfileHeader';

describe('ProfileHeader Component', () => {
  const mockUser = {
    username: 'johndoe',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Food enthusiast and home cook.',
    postsCount: 10,
    followersCount: 100,
    followingCount: 50,
  };

  it('renders user profile information correctly', () => {
    render(<ProfileHeader user={mockUser} />);
    
    expect(screen.getByText(new RegExp(`@${mockUser.username}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockUser.bio, 'i'))).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // posts
    expect(screen.getByText('100')).toBeInTheDocument(); // followers
    expect(screen.getByText('50')).toBeInTheDocument(); // following
  });

  it('renders edit profile button when own profile', () => {
    const onEdit = vi.fn();
    render(<ProfileHeader user={mockUser} isOwnProfile={true} onEditProfile={onEdit} />);
    
    const editBtn = screen.getByRole('button', { name: /edit profile/i });
    expect(editBtn).toBeInTheDocument();
    
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalled();
  });

  it('calls onFollow toggle when follow button is clicked', () => {
    const onFollow = vi.fn();
    render(<ProfileHeader user={mockUser} isOwnProfile={false} onFollowToggle={onFollow} />);
    
    const followBtn = screen.getByRole('button', { name: /follow/i });
    fireEvent.click(followBtn);
    expect(onFollow).toHaveBeenCalled();
  });
});
