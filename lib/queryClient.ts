import { QueryClient } from '@tanstack/react-query';

// One shared React Query client for the whole app. Server data (transactions,
// categories) is cached here — and ONLY here.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // treat data as fresh for 1 minute
      retry: 1,
    },
  },
});
