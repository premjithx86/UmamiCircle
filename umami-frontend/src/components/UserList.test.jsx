import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserList from './UserList';

describe('UserList Component', () => {
  const mockUsers = [
    { _id: '1', username: 'user1', name: 'User One', avatar: 'https://example.com/1.jpg', isFollowing: true },
    { _id: '2', username: 'user2', name: 'User Two', avatar: 'https://example.com/2.jpg', isFollowing: false },
  ];

  it('renders a list of users correctly', () => {
    render(<UserList users={mockUsers} />);

    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
    expect(screen.getByText('User Two')).toBeInTheDocument();
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
  });

  it('shows appropriate follow/following buttons', () => {
    render(<UserList users={mockUsers} />);
    
    expect(screen.getByRole('button', { name: /^following$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^follow$/i })).toBeInTheDocument();
  });

  it('calls onFollowToggle when button is clicked', () => {
    const onFollowToggle = vi.fn();
    render(<UserList users={mockUsers} onFollowToggle={onFollowToggle} />);
    
    fireEvent.click(screen.getByRole('button', { name: /^follow$/i }));
    expect(onFollowToggle).toHaveBeenCalledWith(mockUsers[1]);
  });

  it('renders empty message when no users', () => {
    render(<UserList users={[]} emptyMessage="No users found" />);
    expect(screen.getByText(/No users found/i)).toBeInTheDocument();
  });
});
