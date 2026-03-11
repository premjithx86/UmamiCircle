import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EngagementBar } from './EngagementBar';

describe('EngagementBar Component', () => {
  it('renders all interaction buttons', () => {
    render(<EngagementBar />);
    
    expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /comment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bookmark/i })).toBeInTheDocument();
  });

  it('calls onLikeToggle when like button is clicked', () => {
    const onLikeToggle = vi.fn();
    render(<EngagementBar onLikeToggle={onLikeToggle} />);
    
    fireEvent.click(screen.getByRole('button', { name: /like/i }));
    expect(onLikeToggle).toHaveBeenCalled();
  });

  it('calls onBookmarkToggle when bookmark button is clicked', () => {
    const onBookmarkToggle = vi.fn();
    render(<EngagementBar onBookmarkToggle={onBookmarkToggle} />);
    
    fireEvent.click(screen.getByRole('button', { name: /bookmark/i }));
    expect(onBookmarkToggle).toHaveBeenCalled();
  });

  it('calls onShare when share button is clicked', () => {
    const onShare = vi.fn();
    render(<EngagementBar onShare={onShare} />);
    
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    expect(onShare).toHaveBeenCalled();
  });
});
