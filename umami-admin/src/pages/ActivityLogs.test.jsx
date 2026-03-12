import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ActivityLogs } from './ActivityLogs';
import { AdminProvider } from '../context/AdminContext';
import * as adminService from '../services/adminService';

vi.mock('../services/adminService');

describe('ActivityLogs Component', () => {
  const mockLogs = [
    { 
      _id: 'l1', 
      admin: { username: 'admin1', role: 'Admin' }, 
      action: 'BLOCK_USER', 
      targetType: 'User', 
      targetId: 'u1', 
      createdAt: new Date().toISOString()
    },
    { 
      _id: 'l2', 
      admin: { username: 'admin2', role: 'SuperAdmin' }, 
      action: 'DELETE_POST', 
      targetType: 'Post', 
      targetId: 'p1', 
      createdAt: new Date().toISOString()
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logs correctly', async () => {
    adminService.getAuditLogs.mockResolvedValue(mockLogs);

    render(
      <AdminProvider>
        <ActivityLogs />
      </AdminProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/BLOCK USER/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/DELETE POST/i).length).toBeGreaterThan(0);
    });
  });

  it('filters by action', async () => {
    adminService.getAuditLogs.mockResolvedValue(mockLogs);

    render(
      <AdminProvider>
        <ActivityLogs />
      </AdminProvider>
    );

    const actionFilter = screen.getByLabelText(/action/i);
    fireEvent.change(actionFilter, { target: { value: 'BLOCK_USER' } });

    await waitFor(() => {
      expect(adminService.getAuditLogs).toHaveBeenCalledWith(expect.objectContaining({ action: 'BLOCK_USER' }));
    });
  });
});
