import { render, screen } from '../test/test-utils';
import { describe, it, expect } from 'vitest';
import { ContentGrid } from './ContentGrid';

describe('ContentGrid Component', () => {
  const mockItems = [
    { _id: '1', imageUrl: 'https://via.placeholder.com/300', title: 'Recipe 1' },
    { _id: '2', imageUrl: 'https://via.placeholder.com/300', caption: 'Post 1' },
  ];

  it('renders a grid of items', () => {
    render(<ContentGrid items={mockItems} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
  });

  it('renders empty message when no items', () => {
    const emptyMsg = "No food here!";
    render(<ContentGrid items={[]} emptyMessage={emptyMsg} />);
    expect(screen.getByText(emptyMsg)).toBeInTheDocument();
  });
});
