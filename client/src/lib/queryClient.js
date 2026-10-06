import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // A 4xx (validation, permission, not found) won't fix itself, so don't
      // retry it. Network blips and 5xx get two more attempts. (401s are
      // already handled by the refresh interceptor in lib/api.js.)
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

export default queryClient;
