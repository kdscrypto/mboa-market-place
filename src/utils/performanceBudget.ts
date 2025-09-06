// Performance budget enforcement
interface PerformanceBudget {
  maxBundleSize: number; // in bytes
  maxChunkSize: number;
  maxImageSize: number;
  maxInitialLoadTime: number; // in ms
  maxLCP: number;
  maxFID: number;
  maxCLS: number;
  maxMemoryUsage: number; // in MB
}

const DEFAULT_BUDGET: PerformanceBudget = {
  maxBundleSize: 2 * 1024 * 1024, // 2MB
  maxChunkSize: 500 * 1024, // 500KB
  maxImageSize: 500 * 1024, // 500KB
  maxInitialLoadTime: 3000, // 3s
  maxLCP: 2500, // 2.5s
  maxFID: 100, // 100ms
  maxCLS: 0.1,
  maxMemoryUsage: 50 // 50MB
};

export class PerformanceBudgetMonitor {
  private budget: PerformanceBudget;
  private violations: Array<{ metric: string; actual: number; budget: number; timestamp: number }> = [];

  constructor(customBudget?: Partial<PerformanceBudget>) {
    this.budget = { ...DEFAULT_BUDGET, ...customBudget };
  }

  checkBundleSize(): boolean {
    if (typeof performance === 'undefined') return true;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const totalSize = jsResources.reduce((sum, resource) => sum + (resource.encodedBodySize || 0), 0);

    if (totalSize > this.budget.maxBundleSize) {
      this.addViolation('bundleSize', totalSize, this.budget.maxBundleSize);
      return false;
    }
    return true;
  }

  checkInitialLoadTime(): boolean {
    if (typeof performance === 'undefined') return true;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation?.loadEventEnd - navigation?.loadEventStart;

    if (loadTime > this.budget.maxInitialLoadTime) {
      this.addViolation('initialLoadTime', loadTime, this.budget.maxInitialLoadTime);
      return false;
    }
    return true;
  }

  checkLCP(lcp: number): boolean {
    if (lcp > this.budget.maxLCP) {
      this.addViolation('LCP', lcp, this.budget.maxLCP);
      return false;
    }
    return true;
  }

  checkFID(fid: number): boolean {
    if (fid > this.budget.maxFID) {
      this.addViolation('FID', fid, this.budget.maxFID);
      return false;
    }
    return true;
  }

  checkCLS(cls: number): boolean {
    if (cls > this.budget.maxCLS) {
      this.addViolation('CLS', cls, this.budget.maxCLS);
      return false;
    }
    return true;
  }

  checkMemoryUsage(): boolean {
    if (typeof performance === 'undefined' || !(performance as any).memory) return true;

    const memoryInfo = (performance as any).memory;
    const memoryMB = memoryInfo.usedJSHeapSize / (1024 * 1024);

    if (memoryMB > this.budget.maxMemoryUsage) {
      this.addViolation('memoryUsage', memoryMB, this.budget.maxMemoryUsage);
      return false;
    }
    return true;
  }

  checkImageSize(imageUrl: string, size: number): boolean {
    if (size > this.budget.maxImageSize) {
      this.addViolation('imageSize', size, this.budget.maxImageSize);
      console.warn(`Image ${imageUrl} exceeds size budget: ${size} bytes`);
      return false;
    }
    return true;
  }

  checkAll(): { passed: boolean; violations: typeof this.violations } {
    this.violations = []; // Reset violations

    const checks = [
      this.checkBundleSize(),
      this.checkInitialLoadTime(),
      this.checkMemoryUsage()
    ];

    const passed = checks.every(check => check);
    return { passed, violations: [...this.violations] };
  }

  private addViolation(metric: string, actual: number, budget: number) {
    this.violations.push({
      metric,
      actual,
      budget,
      timestamp: Date.now()
    });

    if (process.env.NODE_ENV === 'development') {
      console.warn(`Performance Budget Violation - ${metric}:`, {
        actual,
        budget,
        overflow: actual - budget
      });
    }
  }

  getBudget(): PerformanceBudget {
    return { ...this.budget };
  }

  setBudget(newBudget: Partial<PerformanceBudget>) {
    this.budget = { ...this.budget, ...newBudget };
  }

  getViolations(): typeof this.violations {
    return [...this.violations];
  }

  generateReport(): string {
    if (this.violations.length === 0) {
      return 'All performance budgets are within limits ✅';
    }

    let report = 'Performance Budget Violations:\n\n';
    this.violations.forEach(violation => {
      const percentage = ((violation.actual - violation.budget) / violation.budget * 100).toFixed(1);
      report += `❌ ${violation.metric}: ${violation.actual.toFixed(2)} (budget: ${violation.budget}) - ${percentage}% over budget\n`;
    });

    return report;
  }
}

// Singleton instance
export const performanceBudgetMonitor = new PerformanceBudgetMonitor();

// React hook
export const usePerformanceBudget = () => {
  return {
    checkAll: () => performanceBudgetMonitor.checkAll(),
    checkLCP: (lcp: number) => performanceBudgetMonitor.checkLCP(lcp),
    checkFID: (fid: number) => performanceBudgetMonitor.checkFID(fid),
    checkCLS: (cls: number) => performanceBudgetMonitor.checkCLS(cls),
    checkImageSize: (url: string, size: number) => performanceBudgetMonitor.checkImageSize(url, size),
    getBudget: () => performanceBudgetMonitor.getBudget(),
    setBudget: (budget: Partial<PerformanceBudget>) => performanceBudgetMonitor.setBudget(budget),
    getViolations: () => performanceBudgetMonitor.getViolations(),
    generateReport: () => performanceBudgetMonitor.generateReport()
  };
};