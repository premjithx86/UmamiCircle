import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { vi } from 'vitest';

// Custom render that includes all providers
const AllTheProviders = ({ children, initialEntries = ['/'] }) => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <MemoryRouter initialEntries={initialEntries}>
            {children}
          </MemoryRouter>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

const customRender = (ui, { route = '/', ...options } = {}) =>
  render(ui, { 
    wrapper: (props) => <AllTheProviders {...props} initialEntries={[route]} />, 
    ...options 
  });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
