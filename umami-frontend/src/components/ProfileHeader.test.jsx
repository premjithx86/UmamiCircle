import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProfileHeader } from './ProfileHeader';

describe('ProfileHeader Component', () => {
  const mockUser = {
    username: 'johndoe',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Food enthusiast and home cook.',
    stats: {
      posts: 10,
      followers: 100,
      following: 50,
    },
  };

  it('renders user profile information correctly', () => {
    render(<ProfileHeader user={mockUser} />);

    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.bio)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // posts
    expect(screen.getByText('100')).toBeInTheDocument(); // followers
    expect(screen.getByText('50')).toBeInTheDocument(); // following
    
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', mockUser.avatar);
  });

  it('renders follow button when not own profile', () => {
    render(<ProfileHeader user={mockUser} isOwnProfile={false} isFollowing={false} />);
    expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument();
  });

  it('renders following button when already following', () => {
    render(<ProfileHeader user={mockUser} isOwnProfile={false} isFollowing={true} />);
    expect(screen.getByRole('button', { name: /following/i })).toBeInTheDocument();
  });

  it('renders edit profile button when own profile', () => {
    render(<ProfileHeader user={mockUser} isOwnProfile={true} />);
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
  });

  it('calls onFollow toggle when follow button is clicked', () => {
    const onFollowToggle = vi.fn();
    render(<ProfileHeader user={mockUser} isOwnProfile={false} isFollowing={false} onFollowToggle={onFollowToggle} />);
    
    fireEvent.click(screen.getByRole('button', { name: /follow/i }));
    expect(onFollowToggle).toHaveBeenCalledTimes(1);
  });
});
