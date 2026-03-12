import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OptimizedImage } from './OptimizedImage';

describe('OptimizedImage Component', () => {
  const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/v123/sample.jpg';
  const externalUrl = 'https://example.com/image.jpg';

  it('applies optimization to Cloudinary URLs', () => {
    render(<OptimizedImage src={cloudinaryUrl} alt="Test" width={300} height={200} />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toContain('/upload/q_auto,f_auto,w_300,h_200,c_fill/');
  });

  it('does not transform external URLs', () => {
    render(<OptimizedImage src={externalUrl} alt="Test" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe(externalUrl);
  });

  it('sets lazy loading by default', () => {
    render(<OptimizedImage src={externalUrl} alt="Test" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('sets eager loading when lazy is false', () => {
    render(<OptimizedImage src={externalUrl} alt="Test" lazy={false} />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('loading')).toBe('eager');
  });
});
