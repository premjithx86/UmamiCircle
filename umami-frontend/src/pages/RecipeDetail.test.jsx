import { render, screen } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { RecipeDetail } from './RecipeDetail';
import api from '../services/api';

// Mock useAuth directly
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    userData: { _id: 'user123', username: 'testuser', name: 'Test User' },
    currentUser: { uid: 'uid123' },
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

describe('RecipeDetail Page', () => {
  const mockRecipe = {
    _id: 'recipe123',
    user: {
      _id: 'u1',
      username: 'masterchef',
      name: 'Master Chef',
      profilePicUrl: 'https://via.placeholder.com/40',
    },
    title: 'Classic Scrambled Eggs',
    description: 'The secret is slow cooking and lots of butter.',
    ingredients: ['3 Large Eggs', '20g Butter'],
    steps: ['Whisk eggs', 'Cook slowly'],
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8',
    tags: ['breakfast', 'eggs'],
    createdAt: new Date().toISOString(),
    likes: ['user123'],
    commentsCount: 1,
  };

  const mockComments = [
    { _id: 'c1', content: 'Delicious!', user: { username: 'user2', name: 'User Two' }, createdAt: new Date().toISOString() }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders recipe information correctly', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/recipes/recipe123')) return Promise.resolve({ data: mockRecipe });
      if (url.includes('/comments/Recipe/')) return Promise.resolve({ data: mockComments });
      return Promise.reject(new Error('Not found'));
    });

    render(
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetail />} />
      </Routes>,
      { route: '/recipes/recipe123' }
    );

    // Wait for data
    const title = await screen.findByText(/Classic Scrambled Eggs/i);
    expect(title).toBeInTheDocument();
    expect(screen.getByText(/The secret is slow cooking/i)).toBeInTheDocument();
    expect(screen.getByText(/3 Large Eggs/i)).toBeInTheDocument();
    expect(screen.getByText(/Whisk eggs/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Master Chef/i)[0]).toBeInTheDocument();
  });

  it('handles error when recipe not found', async () => {
    api.get.mockRejectedValue(new Error('Recipe not found'));

    render(
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetail />} />
      </Routes>,
      { route: '/recipes/notfound' }
    );

    const errorMsg = await screen.findByText(/Failed to load recipe/i);
    expect(errorMsg).toBeInTheDocument();
  });
});
