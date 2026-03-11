import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BlockModal } from './BlockModal';

describe('BlockModal Component', () => {
  it('renders block confirmation text correctly', () => {
    render(
      <BlockModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        username="testuser"
        isBlocking={true}
      />
    );

    expect(screen.getByRole('heading', { name: /Block testuser\?/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to block testuser\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm Block/i })).toBeInTheDocument();
  });

  it('renders unblock confirmation text correctly', () => {
    render(
      <BlockModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        username="testuser"
        isBlocking={false}
      />
    );

    expect(screen.getByRole('heading', { name: /Unblock testuser\?/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to unblock testuser\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm Unblock/i })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <BlockModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        username="testuser"
        isBlocking={true}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Confirm Block/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
