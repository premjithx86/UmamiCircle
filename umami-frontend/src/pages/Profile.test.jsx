import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Profile from './Profile';

describe('Profile Page', () => {
  it('renders loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/u/testuser']}>
        <Routes>
          <Route path="/u/:username" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
