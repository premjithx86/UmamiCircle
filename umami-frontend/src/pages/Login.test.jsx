import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../context/AuthContext';
import { Login } from './Login';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Login Page', () => {
  it('renders login form correctly', async () => {
    render(
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Login to UmamiCircle/i)).toBeInTheDocument();
    });
    
    expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
  });
});
