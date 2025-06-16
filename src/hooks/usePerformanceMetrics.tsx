
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const usePerformanceMetrics = (pageName: string) => {
  const metricsRef = useRef<PerformanceMetrics>({});

  useEffect(() => {
    // Measure First Contentful Paint
    const measureFCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          metricsRef.current.fcp = fcpEntry.startTime;
          console.log(`[${pageName}] FCP: ${fcpEntry.startTime.toFixed(2)}ms`);
          observer.disconnect();
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    };

    // Measure Largest Contentful Paint
    const measureLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          metricsRef.current.lcp = lastEntry.startTime;
          console.log(`[${pageName}] LCP: ${lastEntry.startTime.toFixed(2)}ms`);
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    };

    // Measure First Input Delay
    const measureFID = () => {
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
    };

    // Measure Cumulative Layout Shift
    const measureCLS = () => {
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
    };

    // Measure Time to First Byte
    const measureTTFB = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        metricsRef.current.ttfb = ttfb;
        console.log(`[${pageName}] TTFB: ${ttfb.toFixed(2)}ms`);
      }
    };

    // Initialize measurements
    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();
    
    // Wait for page load to measure TTFB
    if (document.readyState === 'complete') {
      measureTTFB();
    } else {
      window.addEventListener('load', measureTTFB);
    }

    // Report metrics after 5 seconds
    const reportTimer = setTimeout(() => {
      console.log(`[${pageName}] Performance Summary:`, metricsRef.current);
      
      // Send to analytics (if gtag is available)
      if (typeof window !== 'undefined' && window.gtag) {
        Object.entries(metricsRef.current).forEach(([metric, value]) => {
          if (value !== undefined && window.gtag) {
            window.gtag('event', 'performance_metric', {
              metric_name: metric,
              metric_value: Math.round(value),
              page_name: pageName
            });
          }
        });
      }
    }, 5000);

    return () => {
      clearTimeout(reportTimer);
      window.removeEventListener('load', measureTTFB);
    };
  }, [pageName]);

  return metricsRef.current;
};
