import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Search } from './Search';
import api from '../services/api';

describe('Search Page', () => {
  const mockPosts = [{ _id: 'p1', imageUrl: 'https://via.placeholder.com/300' }];
  const mockUsers = [{ _id: 'u1', username: 'chef1', profilePicUrl: '' }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and handles post search', async () => {
    api.get.mockResolvedValue({ data: mockPosts });

    render(<Search />);

    const searchInput = screen.getByPlaceholderText(/Search recipes, tags, or chefs/i);
    fireEvent.change(searchInput, { target: { value: 'pasta' } });

    // Wait for debounce and API call
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/posts/search?q=pasta');
    }, { timeout: 2000 });

    const items = await screen.findAllByRole('img');
    expect(items.length).toBeGreaterThan(0);
  });

  it('handles user search when switching tabs', async () => {
    api.get.mockResolvedValue({ data: mockUsers });

    render(<Search />);

    const searchInput = screen.getByPlaceholderText(/Search recipes, tags, or chefs/i);
    fireEvent.change(searchInput, { target: { value: 'chef' } });

    const chefsTab = screen.getByRole('button', { name: /Chefs/i });
    fireEvent.click(chefsTab);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/users/search?q=chef');
    }, { timeout: 2000 });

    const user = await screen.findByText(/chef1/i);
    expect(user).toBeInTheDocument();
  });

  it('shows no results message', async () => {
    api.get.mockResolvedValue({ data: [] });

    render(<Search />);

    const searchInput = screen.getByPlaceholderText(/Search recipes, tags, or chefs/i);
    fireEvent.change(searchInput, { target: { value: 'nothingfound' } });

    const msg = await screen.findByText(/We couldn't find any results for "nothingfound"/i);
    expect(msg).toBeInTheDocument();
  });
});
