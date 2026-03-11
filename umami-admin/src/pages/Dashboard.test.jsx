import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Dashboard } from './Dashboard';
import { AdminProvider } from '../context/AdminContext';
import * as adminService from '../services/adminService';

vi.mock('../services/adminService');

describe('Dashboard Component', () => {
  const mockStats = {
    totalUsers: 150,
    dailyPosts: 25,
    activeUsers: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard statistics correctly', async () => {
    adminService.getDashboardStats.mockResolvedValue(mockStats);

    render(
      <AdminProvider>
        <Dashboard />
      </AdminProvider>
    );

    // Check for skeleton or loading state if applicable, but let's wait for the data
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Daily Posts')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
  });

  it('handles error when fetching stats', async () => {
    adminService.getDashboardStats.mockRejectedValue(new Error('Failed to fetch'));

    render(
      <AdminProvider>
        <Dashboard />
      </AdminProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });
});
