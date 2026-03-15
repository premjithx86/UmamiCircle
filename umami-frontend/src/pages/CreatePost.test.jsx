import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePost } from './CreatePost';
import api from '../services/api';

describe('CreatePost Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders creation form', () => {
    render(<CreatePost />);
    expect(screen.getByText(/New Post/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tell the community about your dish/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Share Post/i })).toBeInTheDocument();
  });

  it('handles image selection', async () => {
    render(<CreatePost />);
    
    const file = new File(['food'], 'food.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input'); // I'll add this test-id
    
    fireEvent.change(input, { target: { files: [file] } });
  });

  it('handles post submission with moderation', async () => {
    api.post.mockResolvedValueOnce({ data: { imageUrl: 'https://cloudinary.com/new.jpg' } }); // upload
    api.post.mockResolvedValueOnce({ data: { _id: 'newpost123' } }); // create post

    render(<CreatePost />);

    const captionInput = screen.getByPlaceholderText(/Tell the community about your dish/i);
    fireEvent.change(captionInput, { target: { value: 'Delicious pasta #food' } });

    // Mock file upload
    const file = new File(['food'], 'food.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });

    const submitBtn = screen.getByRole('button', { name: /Share Post/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  });
});
