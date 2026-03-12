import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { Login } from './Login';

describe('Login Page', () => {
  it('renders login form correctly', () => {
    render(
      <HelmetProvider>
        <Login />
      </HelmetProvider>
    );

    expect(screen.getByText(/Login to UmamiCircle/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });
});
