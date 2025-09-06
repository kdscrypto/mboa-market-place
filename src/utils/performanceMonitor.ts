import { scheduleTask } from './scheduler';

// Performance metrics tracking
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  navigationTiming: PerformanceTiming;
  resourceTiming: PerformanceResourceTiming[];
  memoryUsage?: any;
}

// Core Web Vitals tracking
interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics | null = null;
  private webVitals: WebVitals = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
    this.trackNavigationTiming();
  }

  private initializeObservers() {
    // Largest Contentful Paint observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.webVitals.LCP = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay observer
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.webVitals.FID = (entry as any).processingStart - entry.startTime;
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift observer
      try {
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsValue = 0;
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.webVitals.CLS = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  private trackNavigationTiming() {
    scheduleTask(() => {
      if (performance.timing) {
        const timing = performance.timing;
        this.webVitals.TTFB = timing.responseStart - timing.navigationStart;
        this.webVitals.FCP = timing.domContentLoadedEventEnd - timing.navigationStart;
      }
    }, 'low');
  }

  public getMetrics(): PerformanceMetrics | null {
    if (!this.metrics) {
      this.collectMetrics();
    }
    return this.metrics;
  }

  public getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  private collectMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    this.metrics = {
      loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      renderTime: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      navigationTiming: performance.timing,
      resourceTiming: resources,
      memoryUsage: (performance as any).memory
    };
  }

  public trackCustomMetric(name: string, value: number) {
    if (performance.mark) {
      performance.mark(`${name}-${value}`);
    }
  }

  public startMeasure(name: string) {
    if (performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  public endMeasure(name: string) {
    if (performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }
  }

  public getResourcesAboveThreshold(threshold: number = 1000): PerformanceResourceTiming[] {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.filter(resource => resource.duration > threshold);
  }

  public reportMetrics() {
    const metrics = this.getMetrics();
    const vitals = this.getWebVitals();
    
    console.group('Performance Report');
    console.log('Web Vitals:', vitals);
    console.log('Load Metrics:', {
      loadTime: metrics?.loadTime,
      renderTime: metrics?.renderTime
    });
    console.log('Memory Usage:', metrics?.memoryUsage);
    console.groupEnd();
  }

  public dispose() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for React components
export const usePerformanceMonitor = () => {
  return {
    getMetrics: () => performanceMonitor.getMetrics(),
    getWebVitals: () => performanceMonitor.getWebVitals(),
    trackCustomMetric: (name: string, value: number) => performanceMonitor.trackCustomMetric(name, value),
    startMeasure: (name: string) => performanceMonitor.startMeasure(name),
    endMeasure: (name: string) => performanceMonitor.endMeasure(name),
    reportMetrics: () => performanceMonitor.reportMetrics()
  };
};