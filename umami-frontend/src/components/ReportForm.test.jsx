import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReportForm from './ReportForm';

describe('ReportForm Component', () => {
  it('renders report reasons correctly', () => {
    render(<ReportForm onSubmit={() => {}} onCancel={() => {}} />);

    expect(screen.getByLabelText(/Spam/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Inappropriate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Harassment/i)).toBeInTheDocument();
  });

  it('calls onSubmit with selected reason and description', () => {
    const onSubmit = vi.fn();
    render(<ReportForm onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.click(screen.getByLabelText(/Spam/i));
    fireEvent.change(screen.getByPlaceholderText(/Additional details/i), {
      target: { value: 'This user is posting spam links.' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));
    
    expect(onSubmit).toHaveBeenCalledWith({
      reason: 'Spam',
      description: 'This user is posting spam links.'
    });
  });

  it('requires a reason to be selected before submission', () => {
    const onSubmit = vi.fn();
    render(<ReportForm onSubmit={onSubmit} onCancel={() => {}} />);
    
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
