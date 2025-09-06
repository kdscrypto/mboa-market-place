import { performanceMonitor } from './performanceMonitor';
import { performanceBudgetMonitor } from './performanceBudget';
import { scheduleTask } from './scheduler';

// Automated performance testing suite
interface PerformanceTest {
  name: string;
  description: string;
  test: () => Promise<TestResult>;
  threshold?: number;
  critical?: boolean;
}

interface TestResult {
  passed: boolean;
  value: number;
  threshold: number;
  message: string;
  duration: number;
}

interface TestSuite {
  name: string;
  tests: PerformanceTest[];
}

class AutomatedPerformanceTester {
  private testSuites: TestSuite[] = [];
  private testResults: { [suiteName: string]: TestResult[] } = {};
  private isRunning = false;

  constructor() {
    this.initializeDefaultTests();
  }

  private initializeDefaultTests() {
    // Core Web Vitals Tests
    this.addTestSuite({
      name: 'Core Web Vitals',
      tests: [
        {
          name: 'LCP Test',
          description: 'Largest Contentful Paint should be under 2.5s',
          threshold: 2500,
          critical: true,
          test: async () => {
            const startTime = performance.now();
            const vitals = performanceMonitor.getWebVitals();
            const duration = performance.now() - startTime;
            
            const lcp = vitals.LCP || 0;
            return {
              passed: lcp <= 2500,
              value: lcp,
              threshold: 2500,
              message: `LCP: ${lcp.toFixed(2)}ms`,
              duration
            };
          }
        },
        {
          name: 'FID Test',
          description: 'First Input Delay should be under 100ms',
          threshold: 100,
          critical: true,
          test: async () => {
            const startTime = performance.now();
            const vitals = performanceMonitor.getWebVitals();
            const duration = performance.now() - startTime;
            
            const fid = vitals.FID || 0;
            return {
              passed: fid <= 100,
              value: fid,
              threshold: 100,
              message: `FID: ${fid.toFixed(2)}ms`,
              duration
            };
          }
        },
        {
          name: 'CLS Test',
          description: 'Cumulative Layout Shift should be under 0.1',
          threshold: 0.1,
          critical: true,
          test: async () => {
            const startTime = performance.now();
            const vitals = performanceMonitor.getWebVitals();
            const duration = performance.now() - startTime;
            
            const cls = vitals.CLS || 0;
            return {
              passed: cls <= 0.1,
              value: cls,
              threshold: 0.1,
              message: `CLS: ${cls.toFixed(3)}`,
              duration
            };
          }
        }
      ]
    });

    // Memory Tests
    this.addTestSuite({
      name: 'Memory Performance',
      tests: [
        {
          name: 'Memory Usage Test',
          description: 'JavaScript heap usage should be reasonable',
          threshold: 50 * 1024 * 1024, // 50MB
          test: async () => {
            const startTime = performance.now();
            
            if (!(performance as any).memory) {
              return {
                passed: true,
                value: 0,
                threshold: 50 * 1024 * 1024,
                message: 'Memory info not available',
                duration: performance.now() - startTime
              };
            }
            
            const memoryInfo = (performance as any).memory;
            const usedMB = memoryInfo.usedJSHeapSize;
            const duration = performance.now() - startTime;
            
            return {
              passed: usedMB <= 50 * 1024 * 1024,
              value: usedMB,
              threshold: 50 * 1024 * 1024,
              message: `Memory usage: ${(usedMB / 1024 / 1024).toFixed(2)}MB`,
              duration
            };
          }
        },
        {
          name: 'Memory Leak Test',
          description: 'Check for potential memory leaks',
          test: async () => {
            const startTime = performance.now();
            
            if (!(performance as any).memory) {
              return {
                passed: true,
                value: 0,
                threshold: 0,
                message: 'Memory info not available',
                duration: performance.now() - startTime
              };
            }
            
            const initialMemory = (performance as any).memory.usedJSHeapSize;
            
            // Trigger potential cleanup
            if ((window as any).gc) {
              (window as any).gc();
            }
            
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const finalMemory = (performance as any).memory.usedJSHeapSize;
            const memoryDiff = finalMemory - initialMemory;
            const duration = performance.now() - startTime;
            
            return {
              passed: memoryDiff < 5 * 1024 * 1024, // Less than 5MB growth
              value: memoryDiff,
              threshold: 5 * 1024 * 1024,
              message: `Memory change: ${(memoryDiff / 1024 / 1024).toFixed(2)}MB`,
              duration
            };
          }
        }
      ]
    });

    // Resource Tests
    this.addTestSuite({
      name: 'Resource Loading',
      tests: [
        {
          name: 'Bundle Size Test',
          description: 'JavaScript bundle size should be reasonable',
          test: async () => {
            const startTime = performance.now();
            const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
            const jsResources = resources.filter(r => r.name.includes('.js'));
            const totalSize = jsResources.reduce((sum, r) => sum + (r.encodedBodySize || 0), 0);
            const duration = performance.now() - startTime;
            
            return {
              passed: totalSize <= 2 * 1024 * 1024, // 2MB
              value: totalSize,
              threshold: 2 * 1024 * 1024,
              message: `Bundle size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`,
              duration
            };
          }
        },
        {
          name: 'Unused JavaScript Test',
          description: 'Check for excessive unused JavaScript',
          test: async () => {
            const startTime = performance.now();
            
            // This is a simplified check - in practice you'd need more sophisticated analysis
            const scripts = document.querySelectorAll('script[src]');
            const scriptCount = scripts.length;
            const duration = performance.now() - startTime;
            
            return {
              passed: scriptCount <= 10, // Arbitrary threshold
              value: scriptCount,
              threshold: 10,
              message: `Script count: ${scriptCount}`,
              duration
            };
          }
        }
      ]
    });

    // Rendering Performance Tests
    this.addTestSuite({
      name: 'Rendering Performance',
      tests: [
        {
          name: 'Component Render Time Test',
          description: 'Component rendering should be fast',
          test: async () => {
            const startTime = performance.now();
            
            // Simulate component rendering
            await new Promise(resolve => {
              scheduleTask(() => {
                resolve(null);
              }, 'high');
            });
            
            const renderTime = performance.now() - startTime;
            
            return {
              passed: renderTime <= 16, // 60fps = 16ms per frame
              value: renderTime,
              threshold: 16,
              message: `Render time: ${renderTime.toFixed(2)}ms`,
              duration: renderTime
            };
          }
        },
        {
          name: 'DOM Size Test',
          description: 'DOM size should be reasonable',
          test: async () => {
            const startTime = performance.now();
            const domSize = document.getElementsByTagName('*').length;
            const duration = performance.now() - startTime;
            
            return {
              passed: domSize <= 1500, // Recommended maximum
              value: domSize,
              threshold: 1500,
              message: `DOM nodes: ${domSize}`,
              duration
            };
          }
        }
      ]
    });
  }

  addTestSuite(suite: TestSuite) {
    this.testSuites.push(suite);
  }

  addTest(suiteName: string, test: PerformanceTest) {
    const suite = this.testSuites.find(s => s.name === suiteName);
    if (suite) {
      suite.tests.push(test);
    } else {
      this.addTestSuite({
        name: suiteName,
        tests: [test]
      });
    }
  }

  async runTest(suiteName: string, testName: string): Promise<TestResult> {
    const suite = this.testSuites.find(s => s.name === suiteName);
    if (!suite) {
      throw new Error(`Test suite "${suiteName}" not found`);
    }

    const test = suite.tests.find(t => t.name === testName);
    if (!test) {
      throw new Error(`Test "${testName}" not found in suite "${suiteName}"`);
    }

    return await test.test();
  }

  async runTestSuite(suiteName: string): Promise<TestResult[]> {
    const suite = this.testSuites.find(s => s.name === suiteName);
    if (!suite) {
      throw new Error(`Test suite "${suiteName}" not found`);
    }

    const results: TestResult[] = [];
    
    for (const test of suite.tests) {
      try {
        const result = await test.test();
        results.push(result);
      } catch (error) {
        results.push({
          passed: false,
          value: 0,
          threshold: 0,
          message: `Test failed: ${error}`,
          duration: 0
        });
      }
    }

    this.testResults[suiteName] = results;
    return results;
  }

  async runAllTests(): Promise<{ [suiteName: string]: TestResult[] }> {
    if (this.isRunning) {
      throw new Error('Tests are already running');
    }

    this.isRunning = true;
    const allResults: { [suiteName: string]: TestResult[] } = {};

    try {
      for (const suite of this.testSuites) {
        console.log(`Running test suite: ${suite.name}`);
        allResults[suite.name] = await this.runTestSuite(suite.name);
      }
    } finally {
      this.isRunning = false;
    }

    return allResults;
  }

  generateReport(): string {
    let report = 'Performance Test Report\n';
    report += '========================\n\n';

    for (const [suiteName, results] of Object.entries(this.testResults)) {
      report += `${suiteName}:\n`;
      report += '-'.repeat(suiteName.length + 1) + '\n';

      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      report += `Overall: ${passed}/${total} tests passed\n\n`;

      for (const result of results) {
        const status = result.passed ? '✅' : '❌';
        report += `${status} ${result.message}\n`;
      }

      report += '\n';
    }

    return report;
  }

  getTestSuites(): TestSuite[] {
    return [...this.testSuites];
  }

  getTestResults(): { [suiteName: string]: TestResult[] } {
    return { ...this.testResults };
  }

  clearResults() {
    this.testResults = {};
  }

  isTestRunning(): boolean {
    return this.isRunning;
  }
}

// Singleton instance
export const performanceTester = new AutomatedPerformanceTester();

// React hook
export const usePerformanceTesting = () => {
  return {
    runTest: (suiteName: string, testName: string) => performanceTester.runTest(suiteName, testName),
    runTestSuite: (suiteName: string) => performanceTester.runTestSuite(suiteName),
    runAllTests: () => performanceTester.runAllTests(),
    addTest: (suiteName: string, test: PerformanceTest) => performanceTester.addTest(suiteName, test),
    addTestSuite: (suite: TestSuite) => performanceTester.addTestSuite(suite),
    generateReport: () => performanceTester.generateReport(),
    getTestSuites: () => performanceTester.getTestSuites(),
    getTestResults: () => performanceTester.getTestResults(),
    clearResults: () => performanceTester.clearResults(),
    isTestRunning: () => performanceTester.isTestRunning()
  };
};