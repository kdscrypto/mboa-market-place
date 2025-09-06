import { scheduleTask } from './scheduler';
import { performanceMonitor } from './performanceMonitor';
import { performanceBudgetMonitor } from './performanceBudget';

// Real-time performance monitoring with alerts
interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  message: string;
}

interface MonitoringConfig {
  enableRealTimeMonitoring: boolean;
  alertThresholds: {
    LCP: number;
    FID: number;
    CLS: number;
    memoryUsage: number;
    errorRate: number;
  };
  reportingInterval: number;
  enableAutomaticOptimization: boolean;
}

class RealTimePerformanceMonitor {
  private config: MonitoringConfig;
  private alerts: PerformanceAlert[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private errorCount = 0;
  private totalPageViews = 0;
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor(config?: Partial<MonitoringConfig>) {
    this.config = {
      enableRealTimeMonitoring: true,
      alertThresholds: {
        LCP: 3000,
        FID: 200,
        CLS: 0.15,
        memoryUsage: 100, // MB
        errorRate: 0.05 // 5%
      },
      reportingInterval: 30000, // 30 seconds
      enableAutomaticOptimization: true,
      ...config
    };
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.initializeObservers();
    this.startPeriodicReporting();
    this.setupErrorTracking();
    
    console.log('Real-time performance monitoring started');
  }

  stopMonitoring() {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    console.log('Real-time performance monitoring stopped');
  }

  private initializeObservers() {
    if (!('PerformanceObserver' in window)) return;

    // Long Task Observer
    try {
      const longTaskObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            this.createAlert('warning', 'longTask', entry.duration, 50, 
              `Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (e) {
      console.warn('Long task observer not supported');
    }

    // Layout Shift Observer
    try {
      const layoutShiftObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          const value = (entry as any).value;
          if (value > this.config.alertThresholds.CLS) {
            this.createAlert('critical', 'CLS', value, this.config.alertThresholds.CLS,
              `High cumulative layout shift detected: ${value.toFixed(3)}`);
          }
        });
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutShiftObserver);
    } catch (e) {
      console.warn('Layout shift observer not supported');
    }

    // Resource Loading Observer
    try {
      const resourceObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          const resource = entry as PerformanceResourceTiming;
          
          // Check for slow resources
          if (resource.duration > 2000) {
            this.createAlert('warning', 'slowResource', resource.duration, 2000,
              `Slow resource loading: ${resource.name} took ${resource.duration.toFixed(2)}ms`);
          }
          
          // Check for large resources
          if (resource.transferSize > 1024 * 1024) { // 1MB
            this.createAlert('warning', 'largeResource', resource.transferSize, 1024 * 1024,
              `Large resource detected: ${resource.name} is ${(resource.transferSize / 1024 / 1024).toFixed(2)}MB`);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (e) {
      console.warn('Resource observer not supported');
    }
  }

  private startPeriodicReporting() {
    this.monitoringInterval = setInterval(() => {
      scheduleTask(() => this.generatePeriodicReport(), 'low');
    }, this.config.reportingInterval);
  }

  private setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.errorCount++;
      this.checkErrorRate();
      
      // Track error in performance monitor
      performanceMonitor.trackCustomMetric('error-occurred', Date.now());
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.errorCount++;
      this.checkErrorRate();
      
      console.error('Unhandled promise rejection:', event.reason);
    });
  }

  private checkErrorRate() {
    this.totalPageViews = Math.max(this.totalPageViews, 1);
    const errorRate = this.errorCount / this.totalPageViews;
    
    if (errorRate > this.config.alertThresholds.errorRate) {
      this.createAlert('critical', 'errorRate', errorRate, this.config.alertThresholds.errorRate,
        `High error rate detected: ${(errorRate * 100).toFixed(2)}%`);
    }
  }

  private checkMemoryUsage() {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memoryInfo = (performance as any).memory;
      const memoryMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
      
      if (memoryMB > this.config.alertThresholds.memoryUsage) {
        this.createAlert('critical', 'memoryUsage', memoryMB, this.config.alertThresholds.memoryUsage,
          `High memory usage detected: ${memoryMB.toFixed(2)}MB`);
        
        if (this.config.enableAutomaticOptimization) {
          this.triggerMemoryOptimization();
        }
      }
    }
  }

  private triggerMemoryOptimization() {
    // Trigger garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
    
    // Clear caches
    scheduleTask(() => {
      // Implementation would depend on your caching system
      console.log('Triggering automatic memory optimization');
    }, 'high');
  }

  private createAlert(
    type: 'warning' | 'critical',
    metric: string,
    value: number,
    threshold: number,
    message: string
  ) {
    const alert: PerformanceAlert = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      metric,
      value,
      threshold,
      timestamp: Date.now(),
      message
    };

    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Log critical alerts immediately
    if (type === 'critical') {
      console.error('Performance Alert:', alert);
    } else {
      console.warn('Performance Warning:', alert);
    }

    // Trigger custom event for UI components
    window.dispatchEvent(new CustomEvent('performanceAlert', { detail: alert }));
  }

  private generatePeriodicReport() {
    const vitals = performanceMonitor.getWebVitals();
    const metrics = performanceMonitor.getMetrics();
    const budgetCheck = performanceBudgetMonitor.checkAll();

    // Check vital thresholds
    if (vitals.LCP && vitals.LCP > this.config.alertThresholds.LCP) {
      this.createAlert('critical', 'LCP', vitals.LCP, this.config.alertThresholds.LCP,
        `LCP exceeds threshold: ${vitals.LCP.toFixed(2)}ms`);
    }

    if (vitals.FID && vitals.FID > this.config.alertThresholds.FID) {
      this.createAlert('critical', 'FID', vitals.FID, this.config.alertThresholds.FID,
        `FID exceeds threshold: ${vitals.FID.toFixed(2)}ms`);
    }

    this.checkMemoryUsage();

    // Generate summary report
    const report = {
      timestamp: Date.now(),
      vitals,
      metrics,
      budgetViolations: budgetCheck.violations,
      recentAlerts: this.alerts.slice(-10),
      totalAlerts: this.alerts.length,
      errorRate: this.totalPageViews > 0 ? this.errorCount / this.totalPageViews : 0
    };

    // Send to analytics or logging service
    this.reportToAnalytics(report);
  }

  private reportToAnalytics(report: any) {
    // In a real application, you would send this to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.group('Performance Report');
      console.log('Report:', report);
      console.groupEnd();
    }
  }

  // Public methods
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  getRecentAlerts(count = 10): PerformanceAlert[] {
    return this.alerts.slice(-count);
  }

  clearAlerts() {
    this.alerts = [];
  }

  updateConfig(newConfig: Partial<MonitoringConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  incrementPageView() {
    this.totalPageViews++;
  }

  getStats() {
    return {
      totalAlerts: this.alerts.length,
      criticalAlerts: this.alerts.filter(a => a.type === 'critical').length,
      warningAlerts: this.alerts.filter(a => a.type === 'warning').length,
      errorRate: this.totalPageViews > 0 ? this.errorCount / this.totalPageViews : 0,
      totalErrors: this.errorCount,
      totalPageViews: this.totalPageViews,
      isMonitoring: this.isMonitoring
    };
  }
}

// Singleton instance
export const realTimeMonitor = new RealTimePerformanceMonitor();

// React hook
export const useRealTimeMonitoring = () => {
  return {
    startMonitoring: () => realTimeMonitor.startMonitoring(),
    stopMonitoring: () => realTimeMonitor.stopMonitoring(),
    getAlerts: () => realTimeMonitor.getAlerts(),
    getRecentAlerts: (count?: number) => realTimeMonitor.getRecentAlerts(count),
    clearAlerts: () => realTimeMonitor.clearAlerts(),
    updateConfig: (config: Partial<MonitoringConfig>) => realTimeMonitor.updateConfig(config),
    getConfig: () => realTimeMonitor.getConfig(),
    getStats: () => realTimeMonitor.getStats(),
    incrementPageView: () => realTimeMonitor.incrementPageView()
  };
};
