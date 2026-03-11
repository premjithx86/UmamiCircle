import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProfileTabs from './ProfileTabs';

describe('ProfileTabs Component', () => {
  const mockTabs = [
    { id: 'posts', label: 'Posts', count: 10 },
    { id: 'recipes', label: 'Recipes', count: 5 },
    { id: 'bookmarks', label: 'Bookmarks', count: 2 },
  ];

  it('renders all tab labels correctly', () => {
    render(<ProfileTabs tabs={mockTabs} activeTab="posts" onTabChange={() => {}} />);

    expect(screen.getByText(/Posts/i)).toBeInTheDocument();
    expect(screen.getByText(/Recipes/i)).toBeInTheDocument();
    expect(screen.getByText(/Bookmarks/i)).toBeInTheDocument();
  });

  it('highlights the active tab', () => {
    render(<ProfileTabs tabs={mockTabs} activeTab="recipes" onTabChange={() => {}} />);
    
    const recipesTab = screen.getByText(/Recipes/i).closest('button');
    expect(recipesTab).toHaveClass('border-primary'); // Assuming active style
  });

  it('calls onTabChange when a tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<ProfileTabs tabs={mockTabs} activeTab="posts" onTabChange={onTabChange} />);
    
    fireEvent.click(screen.getByText(/Recipes/i));
    expect(onTabChange).toHaveBeenCalledWith('recipes');
  });
});
