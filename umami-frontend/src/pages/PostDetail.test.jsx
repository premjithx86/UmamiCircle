import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PostDetail } from './PostDetail';

describe('PostDetail Page', () => {
  it('renders post image and information correctly', async () => {
    // Mock data will be handled within the component for now as per previous patterns
    render(
      <MemoryRouter initialEntries={['/posts/post123']}>
        <Routes>
          <Route path="/posts/:id" element={<PostDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Initial loading state check
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Wait for mock data to load
    const image = await screen.findByAltText(/Post image/i);
    expect(image).toBeInTheDocument();
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/Delicious food/i)).toBeInTheDocument();
  });

  it('renders placeholder for engagement bar', async () => {
    render(
      <MemoryRouter initialEntries={['/posts/post123']}>
        <Routes>
          <Route path="/posts/:id" element={<PostDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const engagementBar = await screen.findByTestId('engagement-bar-placeholder');
    expect(engagementBar).toBeInTheDocument();
  });
});
