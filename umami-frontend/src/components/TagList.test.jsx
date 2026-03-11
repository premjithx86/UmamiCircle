import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TagList } from './TagList';
import { MemoryRouter } from 'react-router-dom';

describe('TagList Component', () => {
  const mockTags = ['vegan', 'pasta', 'quick'];

  it('renders a list of tags', () => {
    render(
      <MemoryRouter>
        <TagList tags={mockTags} />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/#vegan/i)).toBeInTheDocument();
    expect(screen.getByText(/#pasta/i)).toBeInTheDocument();
    expect(screen.getByText(/#quick/i)).toBeInTheDocument();
  });

  it('navigates to search when a tag is clicked', () => {
    render(
      <MemoryRouter>
        <TagList tags={mockTags} />
      </MemoryRouter>
    );
    
    const tagLink = screen.getByText(/#vegan/i).closest('a');
    expect(tagLink).toHaveAttribute('href', '/explore?tag=vegan');
  });
});
