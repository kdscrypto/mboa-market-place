
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
}

export const usePerformanceMonitor = (pageName: string) => {
  const metricsRef = useRef<PerformanceMetrics>({});

  useEffect(() => {
    // Measure Time to First Byte (TTFB)
    const measureTTFB = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        metricsRef.current.ttfb = ttfb;
        console.log(`[${pageName}] TTFB: ${ttfb.toFixed(2)}ms`);
      }
    };

    // Measure First Contentful Paint (FCP)
    const measureFCP = () => {
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        metricsRef.current.fcp = fcpEntry.startTime;
        console.log(`[${pageName}] FCP: ${fcpEntry.startTime.toFixed(2)}ms`);
      }
    };

    // Measure Largest Contentful Paint (LCP)
    const measureLCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            metricsRef.current.lcp = lastEntry.startTime;
            console.log(`[${pageName}] LCP: ${lastEntry.startTime.toFixed(2)}ms`);
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        return () => observer.disconnect();
      }
    };

    // Measure First Input Delay (FID)
    const measureFID = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              const fid = entry.processingStart - entry.startTime;
              metricsRef.current.fid = fid;
              console.log(`[${pageName}] FID: ${fid.toFixed(2)}ms`);
            }
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
        
        return () => observer.disconnect();
      }
    };

    // Measure Cumulative Layout Shift (CLS)
    const measureCLS = () => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          metricsRef.current.cls = clsValue;
          console.log(`[${pageName}] CLS: ${clsValue.toFixed(4)}`);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        
        return () => observer.disconnect();
      }
    };

    // Initialize measurements
    const cleanup: (() => void)[] = [];
    
    // Wait for page load to measure TTFB and FCP
    if (document.readyState === 'complete') {
      measureTTFB();
      measureFCP();
    } else {
      window.addEventListener('load', () => {
        measureTTFB();
        measureFCP();
      });
    }

    // Set up real-time observers
    const lcpCleanup = measureLCP();
    const fidCleanup = measureFID();
    const clsCleanup = measureCLS();

    if (lcpCleanup) cleanup.push(lcpCleanup);
    if (fidCleanup) cleanup.push(fidCleanup);
    if (clsCleanup) cleanup.push(clsCleanup);

    // Log summary after 5 seconds
    const summaryTimer = setTimeout(() => {
      console.log(`[${pageName}] Performance Summary:`, {
        ...metricsRef.current,
        timestamp: new Date().toISOString()
      });
    }, 5000);

    return () => {
      cleanup.forEach(fn => fn());
      clearTimeout(summaryTimer);
    };
  }, [pageName]);

  return metricsRef.current;
};
