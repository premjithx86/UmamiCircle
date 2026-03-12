import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ModerationQueue } from './ModerationQueue';
import { AdminProvider } from '../context/AdminContext';
import * as adminService from '../services/adminService';

vi.mock('../services/adminService');

describe('ModerationQueue Component', () => {
  const mockPosts = [
    { _id: 'p1', caption: 'Post 1', user: { username: 'user1' }, imageUrl: 'i1.jpg', moderationStatus: 'pending' },
    { _id: 'p2', caption: 'Post 2', user: { username: 'user2' }, imageUrl: 'i2.jpg', moderationStatus: 'flagged' },
  ];

  const mockRecipes = [
    { _id: 'r1', title: 'Recipe 1', user: { username: 'user1' }, imageUrl: 'ri1.jpg', moderationStatus: 'pending' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
  });

  it('renders posts correctly by default', async () => {
    adminService.getPosts.mockResolvedValue(mockPosts);

    render(
      <AdminProvider>
        <ModerationQueue />
      </AdminProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Post 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Post 2/i)).toBeInTheDocument();
    });
  });

  it('switches to recipes tab', async () => {
    adminService.getPosts.mockResolvedValue(mockPosts);
    adminService.getRecipes.mockResolvedValue(mockRecipes);

    render(
      <AdminProvider>
        <ModerationQueue />
      </AdminProvider>
    );

    const recipesTab = screen.getByRole('button', { name: /recipes/i });
    fireEvent.click(recipesTab);

    await waitFor(() => {
      expect(screen.getByText(/Recipe 1/i)).toBeInTheDocument();
      expect(adminService.getRecipes).toHaveBeenCalled();
    });
  });

  it('deletes a post', async () => {
    adminService.getPosts.mockResolvedValue(mockPosts);
    adminService.deletePost.mockResolvedValue({ message: 'Deleted' });

    render(
      <AdminProvider>
        <ModerationQueue />
      </AdminProvider>
    );

    await waitFor(async () => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
    });

    expect(adminService.deletePost).toHaveBeenCalledWith('p1');
  });

  it('filters by status', async () => {
    adminService.getPosts.mockResolvedValue(mockPosts);

    render(
      <AdminProvider>
        <ModerationQueue />
      </AdminProvider>
    );

    const statusFilter = screen.getByLabelText(/status/i);
    fireEvent.change(statusFilter, { target: { value: 'flagged' } });

    await waitFor(() => {
      expect(adminService.getPosts).toHaveBeenCalledWith(expect.objectContaining({ status: 'flagged' }));
    });
  });
});
