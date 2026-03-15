import { render, screen, waitFor, act } from '../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MainLayout } from './MainLayout';
import api from '../services/api';
import { getSocket } from '../services/socket';

// Mock useAuth
const mockCurrentUser = { uid: 'uid123' };
const mockUserData = { username: 'testuser' };
const mockLogout = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    userData: mockUserData,
    logout: mockLogout,
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

// Mock socket
vi.mock('../services/socket', () => ({
  getSocket: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}));

describe('MainLayout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navbar links for logged in user', async () => {
    api.get.mockResolvedValue({ data: [] }); // For notifications fetch

    render(<MainLayout />);

    expect(screen.getAllByText(/Home/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Explore/i)[0]).toBeInTheDocument();
    expect(screen.getByTitle("Notifications")).toBeInTheDocument();
    expect(screen.getAllByText(/Messages/i)[0]).toBeInTheDocument();
    
    // "Profile" was renamed to "My Kitchen" in the redesign
    expect(screen.getAllByText(/My Kitchen/i)[0]).toBeInTheDocument();
  });

  it('fetches and displays unread notification count', async () => {
    // Return 2 unread notifications
    api.get.mockResolvedValue({ data: [
      { _id: '1', isRead: false },
      { _id: '2', isRead: false }
    ] });

    render(<MainLayout />);

    // Wait for badge to appear
    await waitFor(() => {
      const badge = screen.getByTestId('notification-badge');
      expect(badge).toHaveTextContent('2');
    });
  });

  it('updates unread count in real-time via socket', async () => {
    let socketCallback;
    const mockSocket = {
      on: vi.fn((event, cb) => {
        if (event === 'new_notification') socketCallback = cb;
      }),
      off: vi.fn(),
      emit: vi.fn(),
    };
    getSocket.mockReturnValue(mockSocket);
    
    api.get.mockResolvedValue({ data: [] }); // Initial empty

    render(<MainLayout />);

    // Wait for initial (empty) state to be settled
    await waitFor(() => {
      expect(screen.getAllByText(/Notifications/i)[0]).toBeInTheDocument();
    });

    // Simulate new notification
    await act(async () => {
      if (socketCallback) socketCallback({ _id: '3' });
    });

    await waitFor(() => {
      const badge = screen.getByTestId('notification-badge');
      expect(badge).toHaveTextContent('1');
    });
  });
});
