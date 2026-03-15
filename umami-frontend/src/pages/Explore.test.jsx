import { render, screen, waitFor } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Explore } from './Explore';
import api from '../services/api';

describe('Explore Page', () => {
  const mockContent = [
    { _id: '1', type: 'post', imageUrl: 'https://via.placeholder.com/300' },
    { _id: '2', type: 'recipe', imageUrl: 'https://via.placeholder.com/300' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders content grid with items', async () => {
    api.get.mockResolvedValue({ data: mockContent });

    render(<Explore />);

    const items = await screen.findAllByRole('img');
    expect(items.length).toBeGreaterThan(0);
  });

  it('handles empty explore feed', async () => {
    api.get.mockResolvedValue({ data: [] });

    render(<Explore />);

    const msg = await screen.findByText(/No trending content found/i);
    expect(msg).toBeInTheDocument();
  });
});
