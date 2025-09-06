import { useEffect } from 'react';
import { scheduleTask } from '@/utils/scheduler';

// Performance monitoring hook
export const usePerformanceOptimization = () => {
  useEffect(() => {
    // Monitor web vitals
    const observer = new PerformanceObserver((list) => {
      scheduleTask(() => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('Navigation timing:', {
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              totalTime: navEntry.loadEventEnd - navEntry.fetchStart
            });
          }
        }
      }, 'low');
    });

    try {
      observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input'] });
    } catch (e) {
      // Fallback for browsers that don't support these metrics
      console.log('Performance monitoring not fully supported');
    }

    return () => observer.disconnect();
  }, []);
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/fonts/inter.woff2',
    // Add other critical resources
  ];

  criticalResources.forEach(resource => {
    scheduleTask(() => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.includes('.woff') ? 'font' : 'script';
      if (resource.includes('.woff')) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    }, 'high');
  });
};