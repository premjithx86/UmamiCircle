import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShareModal } from './ShareModal';

describe('ShareModal Component', () => {
  const mockUrl = 'http://localhost:3000/posts/123';

  it('renders the share URL correctly', () => {
    render(<ShareModal isOpen={true} url={mockUrl} onClose={() => {}} />);
    
    expect(screen.getByDisplayValue(mockUrl)).toBeInTheDocument();
  });

  it('copies the URL to clipboard when copy button is clicked', async () => {
    const clipboardMock = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: clipboardMock });

    render(<ShareModal isOpen={true} url={mockUrl} onClose={() => {}} />);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);
    
    expect(clipboardMock.writeText).toHaveBeenCalledWith(mockUrl);
    expect(await screen.findByText(/Copied/i)).toBeInTheDocument();
  });

  it('renders social platform buttons', () => {
    render(<ShareModal isOpen={true} url={mockUrl} onClose={() => {}} />);
    
    expect(screen.getByLabelText(/Share on Twitter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Share on Facebook/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Share on WhatsApp/i)).toBeInTheDocument();
  });
});
