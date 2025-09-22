// PHASE 4 & 5: Performance monitoring and testing system for Adsterra ads
import { useEffect, useRef, useCallback, useState } from 'react';
import { AdsterraZoneValidator } from '@/config/adsterra';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  loadTime?: number;
  adLoadTime?: number;
  isAdBlocked?: boolean;
  networkQuality?: 'fast' | 'slow' | 'offline';
}

interface AdLoadEvent {
  zoneId: string;
  success: boolean;
  loadTime: number;
  errorMessage?: string;
  timestamp: number;
  retryCount: number;
}

interface MonitoringState {
  metrics: PerformanceMetrics;
  adEvents: AdLoadEvent[];
  alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  isMonitoring: boolean;
}

export const useAdPerformanceMonitor = () => {
  const [state, setState] = useState<MonitoringState>({
    metrics: {},
    adEvents: [],
    alerts: [],
    isMonitoring: false
  });

  const observerRef = useRef<PerformanceObserver | null>(null);
  const adLoadStartTimes = useRef<Map<string, number>>(new Map());

  // Performance thresholds
  const THRESHOLDS = {
    LCP_GOOD: 2500,
    LCP_WARNING: 4000,
    AD_LOAD_GOOD: 2000,
    AD_LOAD_WARNING: 5000,
    MAX_RETRIES: 3
  };

  const createAlert = useCallback((type: 'error' | 'warning' | 'info', message: string) => {
    const alert = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      alerts: [...prev.alerts.slice(-9), alert] // Keep last 10 alerts
    }));

    console.log(`[AD_MONITOR] ${type.toUpperCase()}: ${message}`);
  }, []);

  // Network quality detection
  const detectNetworkQuality = useCallback((): Promise<'fast' | 'slow' | 'offline'> => {
    return new Promise((resolve) => {
      if (!navigator.onLine) {
        resolve('offline');
        return;
      }

      const startTime = performance.now();
      const testImage = new Image();
      
      testImage.onload = () => {
        const loadTime = performance.now() - startTime;
        resolve(loadTime < 500 ? 'fast' : 'slow');
      };
      
      testImage.onerror = () => resolve('offline');
      
      // Small test image from a CDN
      testImage.src = `https://via.placeholder.com/1x1.png?t=${Date.now()}`;
      
      // Timeout fallback
      setTimeout(() => resolve('slow'), 3000);
    });
  }, []);

  // Ad blocker detection
  const detectAdBlocker = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.cssText = 'position:absolute;left:-9999px;';
      
      document.body.appendChild(testAd);
      
      setTimeout(() => {
        const isBlocked = testAd.offsetHeight === 0;
        document.body.removeChild(testAd);
        resolve(isBlocked);
      }, 100);
    });
  }, []);

  // Core Web Vitals monitoring
  const initCoreWebVitals = useCallback(() => {
    if (!('PerformanceObserver' in window)) {
      createAlert('warning', 'PerformanceObserver not supported');
      return;
    }

    // LCP Observer
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      if (lastEntry) {
        const lcp = lastEntry.startTime;
        setState(prev => ({
          ...prev,
          metrics: { ...prev.metrics, lcp }
        }));

        if (lcp > THRESHOLDS.LCP_WARNING) {
          createAlert('error', `LCP critique: ${Math.round(lcp)}ms (> ${THRESHOLDS.LCP_WARNING}ms)`);
        } else if (lcp > THRESHOLDS.LCP_GOOD) {
          createAlert('warning', `LCP élevé: ${Math.round(lcp)}ms (> ${THRESHOLDS.LCP_GOOD}ms)`);
        }
      }
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      observerRef.current = lcpObserver;
    } catch (error) {
      console.warn('[AD_MONITOR] LCP observer failed:', error);
    }

    // FID Observer
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          setState(prev => ({
            ...prev,
            metrics: { ...prev.metrics, fid: entry.processingStart - entry.startTime }
          }));
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('[AD_MONITOR] FID observer failed:', error);
    }

    // Long tasks observer
    try {
      const longTaskObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            createAlert('warning', `Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('[AD_MONITOR] Long task observer failed:', error);
    }

    // Resource timing observer for slow resources
    try {
      const resourceObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry: any) => {
          if (entry.duration > 2000) {
            createAlert('warning', `Slow resource loading: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['navigation', 'resource'] });
    } catch (error) {
      console.warn('[AD_MONITOR] Resource observer failed:', error);
    }
  }, [createAlert]);

  // Track ad loading start
  const trackAdLoadStart = useCallback((zoneId: string) => {
    adLoadStartTimes.current.set(zoneId, performance.now());
    console.log(`[AD_MONITOR] Ad load started for zone: ${zoneId}`);
  }, []);

  // Track ad loading completion
  const trackAdLoadEnd = useCallback((zoneId: string, success: boolean, errorMessage?: string, retryCount: number = 0) => {
    const startTime = adLoadStartTimes.current.get(zoneId);
    const endTime = performance.now();
    const loadTime = startTime ? endTime - startTime : 0;

    const event: AdLoadEvent = {
      zoneId,
      success,
      loadTime,
      errorMessage,
      timestamp: Date.now(),
      retryCount
    };

    setState(prev => ({
      ...prev,
      adEvents: [...prev.adEvents.slice(-49), event], // Keep last 50 events
      metrics: {
        ...prev.metrics,
        adLoadTime: loadTime
      }
    }));

    // Create alerts based on performance
    if (!success) {
      createAlert('error', `Ad failed to load: ${zoneId} (${errorMessage || 'Unknown error'})`);
    } else if (loadTime > THRESHOLDS.AD_LOAD_WARNING) {
      createAlert('warning', `Slow ad loading: ${zoneId} took ${Math.round(loadTime)}ms`);
    } else if (loadTime > 0) {
      console.log(`[AD_MONITOR] Ad loaded successfully: ${zoneId} in ${Math.round(loadTime)}ms`);
    }

    adLoadStartTimes.current.delete(zoneId);
  }, [createAlert]);

  // Run comprehensive tests
  const runPerformanceTests = useCallback(async () => {
    setState(prev => ({ ...prev, isMonitoring: true }));
    createAlert('info', 'Starting performance tests...');

    try {
      // Test network quality
      const networkQuality = await detectNetworkQuality();
      createAlert('info', `Network quality: ${networkQuality}`);

      // Test ad blocker
      const isAdBlocked = await detectAdBlocker();
      if (isAdBlocked) {
        createAlert('warning', 'Ad blocker detected - ads may not load');
      }

      // Test Adsterra configuration
      const productionZones = AdsterraZoneValidator.getProductionZones();
      if (productionZones.length === 0) {
        createAlert('error', 'No production zones configured');
      } else {
        createAlert('info', `${productionZones.length} production zones configured`);
      }

      // Test zone validity
      productionZones.forEach(zone => {
        if (!AdsterraZoneValidator.validateZoneId(zone.id)) {
          createAlert('error', `Invalid zone ID: ${zone.id}`);
        }
      });

      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          networkQuality,
          isAdBlocked
        }
      }));

      createAlert('info', 'Performance tests completed');
    } catch (error) {
      createAlert('error', `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setState(prev => ({ ...prev, isMonitoring: false }));
    }
  }, [createAlert, detectNetworkQuality, detectAdBlocker]);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const { metrics, adEvents } = state;
    const recentEvents = adEvents.slice(-10);
    const successRate = recentEvents.length > 0 
      ? (recentEvents.filter(e => e.success).length / recentEvents.length) * 100
      : 0;
    
    const avgLoadTime = recentEvents.length > 0
      ? recentEvents.reduce((sum, e) => sum + e.loadTime, 0) / recentEvents.length
      : 0;

    return {
      lcp: metrics.lcp ? Math.round(metrics.lcp) : 'N/A',
      lcpStatus: !metrics.lcp ? 'unknown' : 
                 metrics.lcp <= THRESHOLDS.LCP_GOOD ? 'good' : 
                 metrics.lcp <= THRESHOLDS.LCP_WARNING ? 'warning' : 'poor',
      successRate: Math.round(successRate),
      avgLoadTime: Math.round(avgLoadTime),
      networkQuality: metrics.networkQuality || 'unknown',
      isAdBlocked: metrics.isAdBlocked || false,
      totalEvents: adEvents.length
    };
  }, [state]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setState(prev => ({ ...prev, alerts: [] }));
  }, []);

  // Initialize monitoring
  useEffect(() => {
    initCoreWebVitals();
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [initCoreWebVitals]);

  return {
    ...state,
    trackAdLoadStart,
    trackAdLoadEnd,
    runPerformanceTests,
    getPerformanceSummary,
    clearAlerts,
    createAlert
  };
};