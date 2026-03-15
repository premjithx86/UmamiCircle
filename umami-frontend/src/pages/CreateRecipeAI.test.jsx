import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateRecipe } from './CreateRecipe';
import api from '../services/api';

describe('CreateRecipe AI Assist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('auto-fills form when AI Assist is clicked', async () => {
    const mockSuggestion = {
      description: "Creamy butter chicken with rich spices",
      cookingTime: 30,
      prepTime: 15,
      difficulty: "Medium",
      ingredients: ["Chicken", "Butter", "Tomato sauce"],
      steps: ["Marinate chicken", "Cook in sauce"],
      tags: ["Indian", "Spicy"]
    };

    api.post.mockResolvedValueOnce({ data: mockSuggestion });

    render(<CreateRecipe />);

    const titleInput = screen.getByPlaceholderText(/e.g. Grandma's Famous Lasagna/i);
    fireEvent.change(titleInput, { target: { value: 'Butter Chicken' } });

    const aiBtn = screen.getByRole('button', { name: /AI Assist/i });
    fireEvent.click(aiBtn);

    expect(screen.getByText(/Generating recipe.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/AI Generated/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockSuggestion.description)).toBeInTheDocument();
      expect(screen.getByDisplayValue('15 mins')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30 mins')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Medium')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Chicken')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Butter')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Marinate chicken')).toBeInTheDocument();
    });
  });

  it('shows error message if AI Suggest fails', async () => {
    api.post.mockRejectedValueOnce(new Error('AI suggestion unavailable'));

    render(<CreateRecipe />);

    const titleInput = screen.getByPlaceholderText(/e.g. Grandma's Famous Lasagna/i);
    fireEvent.change(titleInput, { target: { value: 'Butter Chicken' } });

    const aiBtn = screen.getByRole('button', { name: /AI Assist/i });
    fireEvent.click(aiBtn);

    await waitFor(() => {
      expect(screen.getByText(/AI suggestion unavailable/i)).toBeInTheDocument();
    });
  });
});
