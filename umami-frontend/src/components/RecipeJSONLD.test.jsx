import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { RecipeJSONLD } from './RecipeJSONLD';

describe('RecipeJSONLD Component', () => {
  const mockRecipe = {
    title: 'Pasta Carbonara',
    description: 'Classic Italian pasta dish.',
    imageUrl: 'http://example.com/pasta.jpg',
    user: { username: 'chef_mario' },
    createdAt: '2026-03-12T00:00:00.000Z',
    ingredients: ['Pasta', 'Eggs', 'Cheese'],
    instructions: ['Boil water', 'Cook pasta', 'Mix everything'],
    prepTime: '15 mins',
    servings: 2,
  };

  it('injects JSON-LD script into the document', async () => {
    render(
      <HelmetProvider>
        <RecipeJSONLD recipe={mockRecipe} />
      </HelmetProvider>
    );

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    
    const json = JSON.parse(script?.innerHTML || '{}');
    expect(json['@type']).toBe('Recipe');
    expect(json.name).toBe(mockRecipe.title);
    expect(json.recipeIngredient).toEqual(mockRecipe.ingredients);
  });

  it('renders nothing when recipe is null', () => {
    const { container } = render(
      <HelmetProvider>
        <RecipeJSONLD recipe={null} />
      </HelmetProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('handles recipe without prepTime', async () => {
    const recipeNoPrep = { ...mockRecipe, prepTime: null };
    render(
      <HelmetProvider>
        <RecipeJSONLD recipe={recipeNoPrep} />
      </HelmetProvider>
    );

    const script = document.querySelector('script[type="application/ld+json"]');
    const json = JSON.parse(script?.innerHTML || '{}');
    expect(json.prepTime).toBeUndefined();
  });
});
