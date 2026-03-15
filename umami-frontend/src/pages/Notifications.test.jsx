import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Notifications } from './Notifications';
import api from '../services/api';
import { getSocket } from '../services/socket';

describe('Notifications Page', () => {
  const mockNotifications = [
    {
      _id: 'n1',
      type: 'like',
      actor: { username: 'chef1' },
      targetType: 'Post',
      targetId: 'p1',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'n2',
      type: 'follow',
      actor: { username: 'chef2' },
      isRead: true,
      createdAt: new Date().toISOString(),
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notifications list', async () => {
    api.get.mockResolvedValue({ data: mockNotifications });

    render(<Notifications />);

    const n1 = await screen.findByText(/liked your post/i);
    expect(n1).toBeInTheDocument();
    expect(screen.getAllByText(/chef1/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/started following you/i)).toBeInTheDocument();
    expect(screen.getAllByText(/chef2/i)[0]).toBeInTheDocument();
  });

  it('handles mark all as read', async () => {
    api.get.mockResolvedValue({ data: mockNotifications });
    api.put.mockResolvedValue({ success: true });

    render(<Notifications />);

    const markReadBtn = await screen.findByText(/Mark all as read/i);
    fireEvent.click(markReadBtn);

    expect(api.put).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('handles empty notifications', async () => {
    api.get.mockResolvedValue({ data: [] });

    render(<Notifications />);

    const msg = await screen.findByText(/No notifications yet/i);
    expect(msg).toBeInTheDocument();
  });

  it('renders message notification', async () => {
    const messageNotification = [
      {
        _id: 'n3',
        type: 'message',
        actor: { username: 'chef3', name: 'Chef Three' },
        targetType: 'Conversation',
        targetId: 'c1',
        isRead: false,
        createdAt: new Date().toISOString(),
      }
    ];
    api.get.mockResolvedValue({ data: messageNotification });

    render(<Notifications />);

    const n3 = await screen.findByText(/sent you a message/i);
    expect(n3).toBeInTheDocument();
    expect(screen.getByText(/Chef Three/i)).toBeInTheDocument();
  });
});
