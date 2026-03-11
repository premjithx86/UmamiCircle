import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EditProfileForm from './EditProfileForm';

describe('EditProfileForm Component', () => {
  const mockUser = {
    username: 'johndoe',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Food enthusiast and home cook.',
  };

  it('renders initial user values correctly', () => {
    render(<EditProfileForm user={mockUser} onSubmit={() => {}} onCancel={() => {}} />);

    expect(screen.getByLabelText(/Name/i)).toHaveValue(mockUser.name);
    expect(screen.getByLabelText(/Bio/i)).toHaveValue(mockUser.bio);
  });

  it('calls onSubmit with updated values', () => {
    const onSubmit = vi.fn();
    render(<EditProfileForm user={mockUser} onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: 'New bio' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Jane Doe',
      bio: 'New bio',
    }));
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<EditProfileForm user={mockUser} onSubmit={() => {}} onCancel={onCancel} />);
    
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
