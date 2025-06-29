
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Export everything from @testing-library/react
export * from '@testing-library/react';
// Override render with our custom version
export { customRender as render };
// Explicitly export screen and waitFor
export { screen, waitFor };
