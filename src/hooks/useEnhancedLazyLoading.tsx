
import { useEffect, useRef, useState, useCallback } from 'react';

interface LazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  fallbackTimeout?: number;
}

interface LazyLoadingResult<T extends HTMLElement> {
  elementRef: React.RefObject<T>;
  isIntersecting: boolean;
  hasIntersected: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useEnhancedLazyLoading<T extends HTMLElement = HTMLDivElement>(
  options: LazyLoadingOptions = {}
): LazyLoadingResult<T> {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = false,
    delay = 0,
    fallbackTimeout = 3000
  } = options;

  const elementRef = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const delayTimeoutRef = useRef<NodeJS.Timeout>();

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting) {
      setIsLoading(true);
      
      if (delay > 0) {
        delayTimeoutRef.current = setTimeout(() => {
          setIsIntersecting(true);
          setHasIntersected(true);
          setIsLoading(false);
        }, delay);
      } else {
        setIsIntersecting(true);
        setHasIntersected(true);
        setIsLoading(false);
      }
    } else if (!triggerOnce) {
      setIsIntersecting(false);
      setIsLoading(false);
    }
  }, [delay, triggerOnce]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if IntersectionObserver is available
    if (!window.IntersectionObserver) {
      // Fallback for older browsers
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    observer.observe(element);

    // Fallback timeout in case intersection observer fails
    timeoutRef.current = setTimeout(() => {
      if (!hasIntersected) {
        setError(new Error('Lazy loading timeout'));
        setIsIntersecting(true);
        setHasIntersected(true);
        setIsLoading(false);
      }
    }, fallbackTimeout);

    return () => {
      observer.unobserve(element);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, [handleIntersection, threshold, rootMargin, fallbackTimeout, hasIntersected]);

  // Connection-aware loading
  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection && connection.effectiveType) {
      const slowConnections = ['slow-2g', '2g'];
      if (slowConnections.includes(connection.effectiveType)) {
        // Increase delay for slow connections
        // This is handled by the delay parameter passed to the hook
      }
    }
  }, []);

  return {
    elementRef,
    isIntersecting: isIntersecting || hasIntersected,
    hasIntersected,
    isLoading,
    error
  };
}
