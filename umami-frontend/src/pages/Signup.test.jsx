import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { Signup } from './Signup';

describe('Signup Page', () => {
  it('renders signup form correctly', () => {
    render(
      <HelmetProvider>
        <Signup />
      </HelmetProvider>
    );

    expect(screen.getByText(/Join UmamiCircle/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });
});
