// PHASE 4 & 5: Analytics tracking for Adsterra ads
import { useCallback, useRef } from 'react';
import { getConfigByZoneId } from '@/config/adsterra';

interface AdAnalyticsEvent {
  type: 'impression' | 'click' | 'load' | 'error';
  zoneId: string;
  placement: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface AnalyticsState {
  events: AdAnalyticsEvent[];
  impressions: Map<string, number>;
  clicks: Map<string, number>;
  errors: Map<string, number>;
}

// Global analytics state
const analyticsState: AnalyticsState = {
  events: [],
  impressions: new Map(),
  clicks: new Map(),
  errors: new Map()
};

export const useAdAnalytics = (zoneId: string, placement: string = 'unknown') => {
  const impressionTracked = useRef(false);
  const config = getConfigByZoneId(zoneId);

  const trackEvent = useCallback((
    type: AdAnalyticsEvent['type'], 
    metadata?: Record<string, any>
  ) => {
    const event: AdAnalyticsEvent = {
      type,
      zoneId,
      placement,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        isProduction: config?.isProduction || false,
        adType: config?.type || 'unknown'
      }
    };

    // Store event
    analyticsState.events.push(event);
    
    // Keep only last 1000 events
    if (analyticsState.events.length > 1000) {
      analyticsState.events = analyticsState.events.slice(-1000);
    }

    // Update counters
    switch (type) {
      case 'impression':
        analyticsState.impressions.set(zoneId, (analyticsState.impressions.get(zoneId) || 0) + 1);
        break;
      case 'click':
        analyticsState.clicks.set(zoneId, (analyticsState.clicks.get(zoneId) || 0) + 1);
        break;
      case 'error':
        analyticsState.errors.set(zoneId, (analyticsState.errors.get(zoneId) || 0) + 1);
        break;
    }

    console.log(`[AD_ANALYTICS] ${type.toUpperCase()}: ${zoneId} (${placement})`, event);
    
    // Send to external analytics if needed
    try {
      if (window.gtag) {
        window.gtag('event', `ad_${type}`, {
          event_category: 'advertisements',
          event_label: zoneId,
          custom_parameter_placement: placement,
          custom_parameter_production: config?.isProduction || false
        });
      }
    } catch (error) {
      console.warn('[AD_ANALYTICS] Failed to send to Google Analytics:', error);
    }
  }, [zoneId, placement, config]);

  const trackImpression = useCallback((metadata?: Record<string, any>) => {
    if (!impressionTracked.current) {
      impressionTracked.current = true;
      trackEvent('impression', metadata);
    }
  }, [trackEvent]);

  const trackClick = useCallback((metadata?: Record<string, any>) => {
    trackEvent('click', metadata);
  }, [trackEvent]);

  const trackLoad = useCallback((metadata?: Record<string, any>) => {
    trackEvent('load', metadata);
  }, [trackEvent]);

  const trackError = useCallback((error: string, metadata?: Record<string, any>) => {
    trackEvent('error', { error, ...metadata });
  }, [trackEvent]);

  return {
    trackImpression,
    trackClick,
    trackLoad,
    trackError
  };
};

// Global analytics utilities
export const getAnalyticsData = () => {
  return {
    events: [...analyticsState.events],
    impressions: new Map(analyticsState.impressions),
    clicks: new Map(analyticsState.clicks),
    errors: new Map(analyticsState.errors)
  };
};

export const getAnalyticsSummary = () => {
  const totalImpressions = Array.from(analyticsState.impressions.values()).reduce((sum, count) => sum + count, 0);
  const totalClicks = Array.from(analyticsState.clicks.values()).reduce((sum, count) => sum + count, 0);
  const totalErrors = Array.from(analyticsState.errors.values()).reduce((sum, count) => sum + count, 0);
  
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const errorRate = totalImpressions > 0 ? (totalErrors / totalImpressions) * 100 : 0;

  return {
    totalImpressions,
    totalClicks,
    totalErrors,
    ctr: Math.round(ctr * 100) / 100,
    errorRate: Math.round(errorRate * 100) / 100,
    zones: {
      impressions: Object.fromEntries(analyticsState.impressions),
      clicks: Object.fromEntries(analyticsState.clicks),
      errors: Object.fromEntries(analyticsState.errors)
    }
  };
};

export const clearAnalyticsData = () => {
  analyticsState.events.length = 0;
  analyticsState.impressions.clear();
  analyticsState.clicks.clear();
  analyticsState.errors.clear();
  console.log('[AD_ANALYTICS] Analytics data cleared');
};

// Global type declarations
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
