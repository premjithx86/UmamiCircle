import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserManagement } from './UserManagement';
import { AdminProvider } from '../context/AdminContext';
import * as adminService from '../services/adminService';

vi.mock('../services/adminService');

describe('UserManagement Component', () => {
  const mockUsers = [
    { _id: '1', username: 'user1', email: 'u1@t.com', name: 'User 1', isBlocked: false },
    { _id: '2', username: 'user2', email: 'u2@t.com', name: 'User 2', isBlocked: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
  });

  it('renders user list correctly', async () => {
    adminService.getUsers.mockResolvedValue(mockUsers);

    render(
      <AdminProvider>
        <UserManagement />
      </AdminProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/user1/i)).toBeInTheDocument();
      expect(screen.getByText(/user2/i)).toBeInTheDocument();
    });

    expect(screen.getByText('u1@t.com')).toBeInTheDocument();
  });

  it('searches users', async () => {
    adminService.getUsers.mockResolvedValue(mockUsers);

    render(
      <AdminProvider>
        <UserManagement />
      </AdminProvider>
    );

    const searchInput = screen.getByPlaceholderText(/search users/i);
    fireEvent.change(searchInput, { target: { value: 'user1' } });

    await waitFor(() => {
      expect(adminService.getUsers).toHaveBeenCalledWith('user1');
    });
  });

  it('toggles block status', async () => {
    adminService.getUsers.mockResolvedValue(mockUsers);
    adminService.toggleBlockUser.mockResolvedValue({ ...mockUsers[0], isBlocked: true });

    render(
      <AdminProvider>
        <UserManagement />
      </AdminProvider>
    );

    await waitFor(() => {
      const blockButtons = screen.getAllByRole('button', { name: /block|unblock/i });
      fireEvent.click(blockButtons[0]);
    });

    expect(adminService.toggleBlockUser).toHaveBeenCalledWith('1', true);
  });

  it('deletes a user after confirmation', async () => {
    adminService.getUsers.mockResolvedValue(mockUsers);
    adminService.deleteUser.mockResolvedValue({ message: 'Deleted' });

    render(
      <AdminProvider>
        <UserManagement />
      </AdminProvider>
    );

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(adminService.deleteUser).toHaveBeenCalledWith('1');
  });

  it('handles error when fetching users', async () => {
    adminService.getUsers.mockRejectedValue(new Error('Failed'));
    render(<AdminProvider><UserManagement /></AdminProvider>);
    await waitFor(() => {
      // It should still render the table with empty or loading state, 
      // but let's check if the service was called
      expect(adminService.getUsers).toHaveBeenCalled();
    });
  });

  it('handles error when deleting user', async () => {
    adminService.getUsers.mockResolvedValue(mockUsers);
    adminService.deleteUser.mockRejectedValue(new Error('Failed'));
    window.alert = vi.fn();

    render(<AdminProvider><UserManagement /></AdminProvider>);
    
    await waitFor(async () => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to delete user');
    });
  });

  it('handles error when toggling block', async () => {
    adminService.getUsers.mockResolvedValue(mockUsers);
    adminService.toggleBlockUser.mockRejectedValue(new Error('Failed'));
    window.alert = vi.fn();

    render(<AdminProvider><UserManagement /></AdminProvider>);
    
    await waitFor(async () => {
      const blockButtons = screen.getAllByRole('button', { name: /block|unblock/i });
      fireEvent.click(blockButtons[0]);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to update user status');
    });
  });
});
