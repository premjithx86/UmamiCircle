import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ContentGrid from './ContentGrid';

describe('ContentGrid Component', () => {
  const mockItems = [
    { _id: '1', imageUrl: 'https://example.com/1.jpg', title: 'Post 1' },
    { _id: '2', imageUrl: 'https://example.com/2.jpg', title: 'Post 2' },
  ];

  it('renders a grid of items', () => {
    render(<ContentGrid items={mockItems} />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(mockItems.length);
    expect(images[0]).toHaveAttribute('src', mockItems[0].imageUrl);
  });

  it('renders empty message when no items', () => {
    render(<ContentGrid items={[]} emptyMessage="No content yet" />);
    expect(screen.getByText(/No content yet/i)).toBeInTheDocument();
  });
});
