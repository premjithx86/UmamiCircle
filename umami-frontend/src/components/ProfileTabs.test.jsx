import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProfileTabs } from './ProfileTabs';

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
    
    const recipesTab = screen.getByTestId('tab-recipes');
    expect(recipesTab).toHaveAttribute('data-state', 'active');
  });

  it('calls onTabChange when a tab is clicked', async () => {
    const onTabChange = vi.fn();
    render(<ProfileTabs tabs={mockTabs} activeTab="posts" onTabChange={onTabChange} />);
    
    const recipesTab = screen.getByTestId('tab-recipes');
    
    // Try multiple ways to activate the Radix Tab
    fireEvent.click(recipesTab);
    fireEvent.keyDown(recipesTab, { key: ' ', code: 'Space' });
    fireEvent.keyDown(recipesTab, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(onTabChange).toHaveBeenCalledWith('recipes');
    }, { timeout: 2000 });
  });
});
