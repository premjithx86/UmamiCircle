import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../context/AuthContext';
import { Signup } from './Signup';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Signup Page', () => {
  it('renders signup form correctly', async () => {
    render(
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <Signup />
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Join UmamiCircle/i)).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign up with Google/i })).toBeInTheDocument();
  });
});
