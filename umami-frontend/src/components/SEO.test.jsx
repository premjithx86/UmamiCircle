import { render, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from './SEO';

describe('SEO Component', () => {
  it('updates document title and meta tags', async () => {
    render(
      <HelmetProvider>
        <SEO 
          title="Test Page" 
          description="Test description" 
          image="test.jpg"
          url="http://localhost/test"
        />
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(document.title).toBe('Test Page | UmamiCircle');
    });

    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription?.getAttribute('content')).toBe('Test description');

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute('content')).toBe('Test Page | UmamiCircle');

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute('content')).toBe('test.jpg');
  });

  it('uses default title when no title is provided', async () => {
    render(
      <HelmetProvider>
        <SEO description="Default title test" />
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(document.title).toBe('UmamiCircle');
    });
  });
});
