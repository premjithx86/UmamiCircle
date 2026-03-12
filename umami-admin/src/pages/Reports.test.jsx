import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Reports } from './Reports';
import { AdminProvider } from '../context/AdminContext';
import * as adminService from '../services/adminService';

vi.mock('../services/adminService');

describe('Reports Component', () => {
  const mockReports = [
    { 
      _id: 'r1', 
      reporter: { username: 'reporter1' }, 
      reason: 'Spam', 
      targetType: 'Post', 
      targetId: 'p1', 
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    { 
      _id: 'r2', 
      reporter: { username: 'reporter2' }, 
      reason: 'Harassment', 
      targetType: 'User', 
      targetId: 'u1', 
      status: 'reviewed',
      createdAt: new Date().toISOString()
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders reports list correctly', async () => {
    adminService.getReports.mockResolvedValue(mockReports);

    render(
      <AdminProvider>
        <Reports />
      </AdminProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Spam/i)).toBeInTheDocument();
      expect(screen.getByText(/Harassment/i)).toBeInTheDocument();
    });
  });

  it('filters by status', async () => {
    adminService.getReports.mockResolvedValue(mockReports);

    render(
      <AdminProvider>
        <Reports />
      </AdminProvider>
    );

    const statusFilter = screen.getByLabelText(/status/i);
    fireEvent.change(statusFilter, { target: { value: 'pending' } });

    await waitFor(() => {
      expect(adminService.getReports).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending' }));
    });
  });

  it('resolves a report', async () => {
    adminService.getReports.mockResolvedValue(mockReports);
    adminService.updateReport.mockResolvedValue({ ...mockReports[0], status: 'action_taken' });

    render(
      <AdminProvider>
        <Reports />
      </AdminProvider>
    );

    await waitFor(async () => {
      const resolveButtons = screen.getAllByRole('button', { name: /resolve|review/i });
      fireEvent.click(resolveButtons[0]);
    });

    // Mock prompt for admin comment
    window.prompt = vi.fn(() => 'Action taken: post removed');

    const actionTakenButton = screen.getByText(/mark action taken/i);
    fireEvent.click(actionTakenButton);

    await waitFor(() => {
      expect(adminService.updateReport).toHaveBeenCalledWith('r1', expect.objectContaining({ 
        status: 'action_taken',
        adminComment: 'Action taken: post removed'
      }));
    });
  });
});
