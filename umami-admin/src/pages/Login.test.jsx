import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AdminProvider } from '../context/AdminContext';
import { Login } from './Login';

describe('Login Page', () => {
  it('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <AdminProvider>
          <Login />
        </AdminProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Umami Admin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });
});
