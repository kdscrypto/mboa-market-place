import { useQuery, useQueryClient } from '@tanstack/react-query';
import { scheduleTask } from '@/utils/scheduler';

// Optimized query hook with automatic caching and background updates
export const useOptimizedQuery = <T>(
  key: string | string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    cacheTime?: number;
    refetchOnWindowFocus?: boolean;
    priority?: 'high' | 'normal' | 'low';
  }
) => {
  const queryClient = useQueryClient();
  
  const result = useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: () => {
      return new Promise<T>((resolve, reject) => {
        scheduleTask(async () => {
          try {
            const data = await queryFn();
            resolve(data);
          } catch (error) {
            reject(error);
          }
        }, options?.priority || 'normal');
      });
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    gcTime: options?.cacheTime || 30 * 60 * 1000, // 30 minutes (renamed from cacheTime in v5)
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    retry: (failureCount, error) => {
      // Only retry on network errors, not on 4xx errors
      return failureCount < 3 && !error?.toString().includes('4');
    }
  });

  // Prefetch related data in the background
  const prefetchRelated = (relatedKeys: string[], relatedQueryFn: () => Promise<any>) => {
    scheduleTask(() => {
      queryClient.prefetchQuery({
        queryKey: relatedKeys,
        queryFn: relatedQueryFn,
        staleTime: 10 * 60 * 1000 // 10 minutes for prefetched data
      });
    }, 'low');
  };

  return { ...result, prefetchRelated };
};