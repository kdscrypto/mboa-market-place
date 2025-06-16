
import React from 'react';
import ResourceHintsManager from './ResourceHintsManager';
import FontOptimizer from './FontOptimizer';
import PerformanceBudgetMonitor from './PerformanceBudgetMonitor';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface PerformanceOptimizationManagerProps {
  enableBudgetMonitoring?: boolean;
  enableServiceWorker?: boolean;
  enableResourceHints?: boolean;
  enableFontOptimization?: boolean;
}

const PerformanceOptimizationManager: React.FC<PerformanceOptimizationManagerProps> = ({
  enableBudgetMonitoring = true,
  enableServiceWorker = true,
  enableResourceHints = true,
  enableFontOptimization = true
}) => {
  // Initialize service worker
  const serviceWorker = useServiceWorker();
  
  // Monitor performance metrics
  const performanceMetrics = usePerformanceMonitor('HomePage');

  // Critical resource hints for immediate loading
  const criticalHints = [
    {
      href: 'https://fonts.googleapis.com',
      rel: 'preconnect' as const,
      importance: 'high' as const
    },
    {
      href: 'https://fonts.gstatic.com',
      rel: 'preconnect' as const,
      crossorigin: true,
      importance: 'high' as const
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      rel: 'preload' as const,
      as: 'style' as const,
      importance: 'high' as const
    }
  ];

  // Prefetch hints for likely next navigation
  const prefetchHints = [
    {
      href: '/recherche',
      rel: 'prefetch' as const,
      importance: 'medium' as const
    },
    {
      href: '/categories',
      rel: 'prefetch' as const,
      importance: 'medium' as const
    },
    {
      href: '/creer-annonce',
      rel: 'prefetch' as const,
      importance: 'low' as const
    }
  ];

  // Font configuration for optimization
  const fontConfigs = [
    {
      family: 'Inter',
      weights: [300, 400, 500, 600, 700],
      display: 'swap' as const,
      preload: true,
      subset: 'latin'
    }
  ];

  React.useEffect(() => {
    // Log service worker status
    if (enableServiceWorker && serviceWorker.isRegistered) {
      console.log('Service Worker is active and registered');
    }

    // Check if update is available
    if (serviceWorker.isUpdateAvailable) {
      console.log('Service Worker update available');
      // You could show a notification to the user here
    }
  }, [serviceWorker, enableServiceWorker]);

  React.useEffect(() => {
    // Implement additional optimizations based on performance metrics
    if (performanceMetrics.lcp && performanceMetrics.lcp > 2500) {
      console.warn('LCP is above threshold, consider optimizing above-the-fold content');
    }

    if (performanceMetrics.fcp && performanceMetrics.fcp > 2000) {
      console.warn('FCP is above threshold, consider optimizing critical rendering path');
    }
  }, [performanceMetrics]);

  // Progressive enhancement based on connection quality
  React.useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        const isSlowConnection = connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
        
        if (isSlowConnection) {
          console.log('Slow connection detected, reducing resource hints');
          // Could disable some prefetching here
        }

        connection.addEventListener('change', () => {
          console.log(`Connection changed: ${connection.effectiveType}`);
        });
      }
    }
  }, []);

  return (
    <>
      {enableResourceHints && (
        <ResourceHintsManager 
          hints={[...criticalHints, ...prefetchHints]}
          enablePrefetching={true}
          enablePreloading={true}
        />
      )}
      
      {enableFontOptimization && (
        <FontOptimizer fonts={fontConfigs} />
      )}
      
      {enableBudgetMonitoring && process.env.NODE_ENV === 'development' && (
        <PerformanceBudgetMonitor />
      )}
    </>
  );
};

export default PerformanceOptimizationManager;
