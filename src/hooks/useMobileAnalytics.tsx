
import { useState, useEffect, useCallback } from 'react';
import { useAdvancedMobileDetection } from './useAdvancedMobileDetection';

interface MobileAnalyticsData {
  sessionId: string;
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop';
    orientation: 'portrait' | 'landscape';
    screenSize: { width: number; height: number };
    performance: 'low' | 'medium' | 'high';
    connection: string;
  };
  userBehavior: {
    scrollDepth: number;
    timeOnPage: number;
    tapCount: number;
    swipeCount: number;
    orientationChanges: number;
  };
  performance: {
    pageLoadTime: number;
    renderTime: number;
    memoryUsage: number;
    fps: number;
  };
}

interface MobileAnalyticsHook {
  analytics: MobileAnalyticsData;
  trackEvent: (event: string, data?: any) => void;
  trackPageView: (page: string) => void;
  trackUserInteraction: (type: 'tap' | 'swipe' | 'scroll', target?: string) => void;
  getInsights: () => {
    engagement: 'low' | 'medium' | 'high';
    deviceOptimization: 'poor' | 'good' | 'excellent';
    recommendations: string[];
  };
}

export const useMobileAnalytics = (): MobileAnalyticsHook => {
  const { deviceType, orientation, screenSize, performanceLevel, connectionType } = useAdvancedMobileDetection();
  
  const [analytics, setAnalytics] = useState<MobileAnalyticsData>({
    sessionId: generateSessionId(),
    deviceInfo: {
      type: deviceType,
      orientation,
      screenSize,
      performance: performanceLevel,
      connection: connectionType
    },
    userBehavior: {
      scrollDepth: 0,
      timeOnPage: 0,
      tapCount: 0,
      swipeCount: 0,
      orientationChanges: 0
    },
    performance: {
      pageLoadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      fps: 60
    }
  });

  // Generate unique session ID
  function generateSessionId(): string {
    return `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track performance metrics
  useEffect(() => {
    const startTime = performance.now();
    
    // Measure page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      setAnalytics(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          pageLoadTime: loadTime
        }
      }));
    });

    // Track memory usage
    const trackMemory = () => {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        setAnalytics(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            memoryUsage: memoryInfo.usedJSHeapSize
          }
        }));
      }
    };

    const memoryInterval = setInterval(trackMemory, 5000);

    // Track FPS
    let frameCount = 0;
    let lastTime = performance.now();
    
    const trackFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setAnalytics(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            fps: frameCount
          }
        }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(trackFPS);
    };
    
    requestAnimationFrame(trackFPS);

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();
    
    const updateTimeOnPage = () => {
      const timeOnPage = Date.now() - startTime;
      setAnalytics(prev => ({
        ...prev,
        userBehavior: {
          ...prev.userBehavior,
          timeOnPage
        }
      }));
    };

    const interval = setInterval(updateTimeOnPage, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      setAnalytics(prev => ({
        ...prev,
        userBehavior: {
          ...prev.userBehavior,
          scrollDepth: Math.max(prev.userBehavior.scrollDepth, scrollDepth)
        }
      }));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track orientation changes
  useEffect(() => {
    setAnalytics(prev => ({
      ...prev,
      deviceInfo: {
        ...prev.deviceInfo,
        type: deviceType,
        orientation,
        screenSize,
        performance: performanceLevel,
        connection: connectionType
      },
      userBehavior: {
        ...prev.userBehavior,
        orientationChanges: prev.userBehavior.orientationChanges + (prev.deviceInfo.orientation !== orientation ? 1 : 0)
      }
    }));
  }, [deviceType, orientation, screenSize, performanceLevel, connectionType]);

  const trackEvent = useCallback((event: string, data?: any) => {
    console.log('Mobile Analytics Event:', event, data);
    // In a real implementation, this would send data to analytics service
  }, []);

  const trackPageView = useCallback((page: string) => {
    trackEvent('page_view', { page, timestamp: Date.now() });
  }, [trackEvent]);

  const trackUserInteraction = useCallback((type: 'tap' | 'swipe' | 'scroll', target?: string) => {
    setAnalytics(prev => ({
      ...prev,
      userBehavior: {
        ...prev.userBehavior,
        tapCount: type === 'tap' ? prev.userBehavior.tapCount + 1 : prev.userBehavior.tapCount,
        swipeCount: type === 'swipe' ? prev.userBehavior.swipeCount + 1 : prev.userBehavior.swipeCount
      }
    }));
    
    trackEvent('user_interaction', { type, target, timestamp: Date.now() });
  }, [trackEvent]);

  const getInsights = useCallback(() => {
    const { userBehavior, performance, deviceInfo } = analytics;
    
    // Calculate engagement level
    let engagement: 'low' | 'medium' | 'high' = 'low';
    if (userBehavior.timeOnPage > 30000 && userBehavior.scrollDepth > 50) {
      engagement = 'high';
    } else if (userBehavior.timeOnPage > 10000 || userBehavior.scrollDepth > 25) {
      engagement = 'medium';
    }

    // Calculate device optimization
    let deviceOptimization: 'poor' | 'good' | 'excellent' = 'poor';
    if (performance.fps > 50 && performance.pageLoadTime < 3000) {
      deviceOptimization = 'excellent';
    } else if (performance.fps > 30 && performance.pageLoadTime < 5000) {
      deviceOptimization = 'good';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (performance.pageLoadTime > 3000) {
      recommendations.push('Optimize page load time for better mobile experience');
    }
    
    if (performance.fps < 30) {
      recommendations.push('Reduce animations and visual effects for smoother performance');
    }
    
    if (deviceInfo.connection === 'slow-2g' || deviceInfo.connection === '2g') {
      recommendations.push('Enable data-saver mode for slow connections');
    }
    
    if (userBehavior.scrollDepth < 25) {
      recommendations.push('Improve above-the-fold content to increase engagement');
    }

    return { engagement, deviceOptimization, recommendations };
  }, [analytics]);

  return {
    analytics,
    trackEvent,
    trackPageView,
    trackUserInteraction,
    getInsights
  };
};
