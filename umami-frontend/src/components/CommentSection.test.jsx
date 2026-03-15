import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommentSection } from './CommentSection';

describe('CommentSection Component', () => {
  const mockComments = [
    { _id: 'c1', user: { username: 'user1', name: 'User One', avatar: '' }, content: 'First comment', createdAt: new Date().toISOString() },
    { _id: 'c2', user: { username: 'user2', name: 'User Two', avatar: '' }, content: 'Second comment', createdAt: new Date().toISOString() },
  ];

  it('renders a list of comments', () => {
    render(<CommentSection comments={mockComments} />);
    
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Second comment')).toBeInTheDocument();
    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText(/@user1/i)).toBeInTheDocument();
  });

  it('calls onAddComment when form is submitted', () => {
    const onAddComment = vi.fn();
    render(<CommentSection onAddComment={onAddComment} />);
    
    const input = screen.getByPlaceholderText(/Add a comment/i);
    fireEvent.change(input, { target: { value: 'New amazing comment' } });
    fireEvent.submit(screen.getByTestId('comment-form'));
    
    expect(onAddComment).toHaveBeenCalledWith('New amazing comment');
  });

  it('calls onDeleteComment when delete button is clicked', () => {
    const onDeleteComment = vi.fn();
    // Assuming user1 is the current user or owner
    render(<CommentSection comments={mockComments} currentUserId="u1" onDeleteComment={onDeleteComment} />);
    
    // We'll need to mock the logic that shows delete button only for owners
    // For now, let's assume it renders for all in the test if callback is provided
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(onDeleteComment).toHaveBeenCalledWith('c1');
  });

  it('renders empty message when no comments', () => {
    render(<CommentSection comments={[]} />);
    expect(screen.getByText(/No comments yet/i)).toBeInTheDocument();
  });
});
