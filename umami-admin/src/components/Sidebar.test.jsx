import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AdminProvider } from '../context/AdminContext';
import { Sidebar } from './Sidebar';

describe('Sidebar Component', () => {
  it('renders sidebar navigation items', () => {
    render(
      <BrowserRouter>
        <AdminProvider>
          <Sidebar />
        </AdminProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Content Moderation/i)).toBeInTheDocument();
    expect(screen.getByText(/Reports/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });
});
