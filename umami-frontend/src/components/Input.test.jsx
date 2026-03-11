import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Input from './Input';

describe('Input Component', () => {
  it('renders label and input correctly', () => {
    render(<Input label="Username" name="username" />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
  });

  it('associates label with input via id', () => {
    render(<Input label="Email" id="user-email" name="email" />);
    const input = screen.getByLabelText(/Email/i);
    expect(input).toHaveAttribute('id', 'user-email');
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<Input label="Name" name="name" onChange={onChange} />);
    
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('displays error message when provided', () => {
    render(<Input label="Password" name="password" error="Required field" />);
    expect(screen.getByText(/Required field/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toHaveClass('border-red-500');
  });
});
