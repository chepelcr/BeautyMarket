import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false, // Don't retry on error so we see errors immediately
      refetchOnWindowFocus: false,
      throwOnError: false, // Don't throw errors to error boundary, handle in components
    },
  },
});
