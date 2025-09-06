import { useCallback, useMemo, useRef } from 'react';
import { scheduleTask, yieldToMain } from '@/utils/scheduler';

// Optimized hooks for performance-critical operations

// Memoized callback that doesn't change unless dependencies change
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

// Memoized value with performance scheduling
export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  priority: 'high' | 'normal' | 'low' = 'normal'
): T => {
  return useMemo(() => {
    if (priority === 'high') {
      return factory();
    } else {
      // For lower priority computations, we yield to main thread
      let result: T;
      scheduleTask(() => {
        result = factory();
      }, priority);
      return result!;
    }
  }, deps);
};

// Debounced callback for expensive operations
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        scheduleTask(() => callback(...args), 'normal');
      }, delay);
    }) as T,
    deps
  );
};

// Throttled callback for high-frequency events
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T => {
  const lastCallRef = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        scheduleTask(() => callback(...args), 'normal');
      }
    }) as T,
    deps
  );
};

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) => {
  const targetRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  const observe = useCallback(() => {
    if (targetRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(callback);
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.1,
          ...options
        }
      );
      observerRef.current.observe(targetRef.current);
    }
  }, [callback, options]);

  return { targetRef, observe, disconnect };
};