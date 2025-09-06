import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Optimized query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Background refetch when data is stale (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Cache data for 30 minutes (renamed to gcTime in v5)
      gcTime: 30 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Don't refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,
      // Background refetch every 15 minutes for active queries
      refetchInterval: 15 * 60 * 1000,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Dev tools commented out for now */}
    </QueryClientProvider>
  );
};