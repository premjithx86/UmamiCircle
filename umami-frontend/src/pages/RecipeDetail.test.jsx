import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RecipeDetail } from './RecipeDetail';

describe('RecipeDetail Page', () => {
  it('renders recipe information correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/recipes/recipe123']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Initial loading state check
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Wait for mock data to load
    const title = await screen.findByRole('heading', { name: /Test Recipe/i, level: 1 });
    expect(title).toBeInTheDocument();
    expect(screen.getByText(/Delicious test recipe description/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Ingredients/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Instructions/i })).toBeInTheDocument();
    expect(screen.getByText(/Easy/i)).toBeInTheDocument();
    expect(screen.getByText(/30 mins/i)).toBeInTheDocument();
    expect(screen.getByText(/4 servings/i)).toBeInTheDocument();
  });
});
