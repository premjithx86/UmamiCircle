import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateRecipe } from './CreateRecipe';
import api from '../services/api';

describe('CreateRecipe Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders creation form', () => {
    render(<CreateRecipe />);
    expect(screen.getByText(/New Recipe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Grandma's Famous Lasagna/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publish Recipe/i })).toBeInTheDocument();
  });

  it('handles form inputs and submission', async () => {
    api.post.mockResolvedValueOnce({ data: { imageUrl: 'https://cloudinary.com/new.jpg', imageHash: 'abc' } }); // upload
    api.post.mockResolvedValueOnce({ status: 201, data: { _id: 'newrecipe123' } }); // create recipe

    render(<CreateRecipe />);

    const titleInput = screen.getByPlaceholderText(/e.g. Grandma's Famous Lasagna/i);
    fireEvent.change(titleInput, { target: { value: 'Best Pasta' } });

    const descInput = screen.getByPlaceholderText(/What makes this dish special/i);
    fireEvent.change(descInput, { target: { value: 'This pasta is the best' } });

    // Fill ingredients
    const ingredientInput = screen.getByPlaceholderText(/Ingredient 1/i);
    fireEvent.change(ingredientInput, { target: { value: 'Pasta' } });

    // Fill steps
    const stepInput = screen.getByPlaceholderText(/Next step/i);
    fireEvent.change(stepInput, { target: { value: 'Boil water' } });

    // Mock file upload
    const file = new File(['food'], 'food.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');
    
    // We need to use a special way to trigger file change if it's hidden, 
    // but fireEvent.change on the input should work if we have the reference.
    Object.defineProperty(input, 'files', {
      value: [file]
    });
    fireEvent.change(input);

    const submitBtn = screen.getByRole('button', { name: /Publish Recipe/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    }, { timeout: 5000 });
  });
});
