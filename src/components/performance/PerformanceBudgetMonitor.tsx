
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface PerformanceBudget {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  bundle: number; // Bundle size in KB
}

interface BudgetViolation {
  metric: string;
  current: number;
  budget: number;
  severity: 'warning' | 'error';
}

const PerformanceBudgetMonitor: React.FC = () => {
  const [violations, setViolations] = useState<BudgetViolation[]>([]);
  const [metrics, setMetrics] = useState<Partial<PerformanceBudget>>({});

  // Performance budgets (targets)
  const budgets: PerformanceBudget = {
    fcp: 2000, // 2 seconds
    lcp: 2500, // 2.5 seconds
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    bundle: 500 // 500KB
  };

  useEffect(() => {
    const checkPerformanceBudget = () => {
      const currentViolations: BudgetViolation[] = [];
      
      // Measure current performance
      const measureMetrics = () => {
        // FCP
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
          const fcp = fcpEntry.startTime;
          setMetrics(prev => ({ ...prev, fcp }));
          
          if (fcp > budgets.fcp) {
            currentViolations.push({
              metric: 'FCP',
              current: fcp,
              budget: budgets.fcp,
              severity: fcp > budgets.fcp * 1.5 ? 'error' : 'warning'
            });
          }
        }

        // LCP
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              const lcp = lastEntry.startTime;
              setMetrics(prev => ({ ...prev, lcp }));
              
              if (lcp > budgets.lcp) {
                currentViolations.push({
                  metric: 'LCP',
                  current: lcp,
                  budget: budgets.lcp,
                  severity: lcp > budgets.lcp * 1.5 ? 'error' : 'warning'
                });
              }
            }
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        // Bundle size check
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        let totalSize = 0;
        
        scripts.forEach(script => {
          const src = script.getAttribute('src');
          if (src && src.includes('assets')) {
            const entries = performance.getEntriesByName(src);
            if (entries.length > 0) {
              const entry = entries[0] as PerformanceResourceTiming;
              totalSize += entry.transferSize || 0;
            }
          }
        });

        const bundleSizeKB = totalSize / 1024;
        setMetrics(prev => ({ ...prev, bundle: bundleSizeKB }));
        
        if (bundleSizeKB > budgets.bundle) {
          currentViolations.push({
            metric: 'Bundle Size',
            current: bundleSizeKB,
            budget: budgets.bundle,
            severity: bundleSizeKB > budgets.bundle * 1.5 ? 'error' : 'warning'
          });
        }

        setViolations(currentViolations);
      };

      if (document.readyState === 'complete') {
        measureMetrics();
      } else {
        window.addEventListener('load', measureMetrics);
      }
    };

    checkPerformanceBudget();
  }, []);

  const getProgressValue = (current: number, budget: number) => {
    return Math.min((current / budget) * 100, 100);
  };

  const getProgressColor = (current: number, budget: number) => {
    const percentage = current / budget;
    if (percentage <= 0.8) return 'bg-green-500';
    if (percentage <= 1) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 w-80 max-h-96 overflow-y-auto bg-white border rounded-lg shadow-lg z-50">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Performance Budget Monitor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Metrics Display */}
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{key.toUpperCase()}</span>
                <span>
                  {typeof value === 'number' 
                    ? (key === 'bundle' ? `${value.toFixed(1)}KB` : `${value.toFixed(0)}ms`)
                    : 'N/A'
                  }
                </span>
              </div>
              {typeof value === 'number' && (
                <Progress
                  value={getProgressValue(value, budgets[key as keyof PerformanceBudget])}
                  className={`h-2 ${getProgressColor(value, budgets[key as keyof PerformanceBudget])}`}
                />
              )}
            </div>
          ))}

          {/* Violations */}
          {violations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-red-600">Budget Violations</h4>
              {violations.map((violation, index) => (
                <Alert key={index} className={`py-2 ${violation.severity === 'error' ? 'border-red-500' : 'border-yellow-500'}`}>
                  <AlertDescription className="text-xs">
                    <strong>{violation.metric}</strong>: {violation.current.toFixed(0)} 
                    {violation.metric === 'Bundle Size' ? 'KB' : 'ms'} 
                    (Budget: {violation.budget}{violation.metric === 'Bundle Size' ? 'KB' : 'ms'})
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceBudgetMonitor;
