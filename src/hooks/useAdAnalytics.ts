import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface AdAnalytics {
  impressions: number;
  clicks: number;
  revenue: number;
  ctr: number;
  placement: string;
  zoneId: string;
}

class AdAnalyticsManager {
  private static instance: AdAnalyticsManager;
  private analytics: Map<string, AdAnalytics> = new Map();
  private impressionQueue: Array<{zoneId: string, placement: string, timestamp: number}> = [];
  private clickQueue: Array<{zoneId: string, placement: string, timestamp: number}> = [];

  static getInstance(): AdAnalyticsManager {
    if (!AdAnalyticsManager.instance) {
      AdAnalyticsManager.instance = new AdAnalyticsManager();
    }
    return AdAnalyticsManager.instance;
  }

  trackImpression(zoneId: string, placement: string) {
    const key = `${zoneId}_${placement}`;
    const existing = this.analytics.get(key) || {
      impressions: 0,
      clicks: 0,
      revenue: 0,
      ctr: 0,
      placement,
      zoneId
    };

    existing.impressions += 1;
    existing.ctr = existing.clicks / existing.impressions;
    this.analytics.set(key, existing);

    // Queue for batch sending
    this.impressionQueue.push({
      zoneId,
      placement,
      timestamp: Date.now()
    });

    // Send analytics to external service
    this.sendAnalytics('impression', { zoneId, placement });
    
    console.log(`Ad Impression: ${zoneId} (${placement})`);
  }

  trackClick(zoneId: string, placement: string) {
    const key = `${zoneId}_${placement}`;
    const existing = this.analytics.get(key) || {
      impressions: 0,
      clicks: 0,
      revenue: 0,
      ctr: 0,
      placement,
      zoneId
    };

    existing.clicks += 1;
    existing.ctr = existing.clicks / existing.impressions;
    this.analytics.set(key, existing);

    // Queue for batch sending
    this.clickQueue.push({
      zoneId,
      placement,
      timestamp: Date.now()
    });

    // Send analytics to external service
    this.sendAnalytics('click', { zoneId, placement });
    
    console.log(`Ad Click: ${zoneId} (${placement})`);
  }

  trackRevenue(zoneId: string, placement: string, amount: number) {
    const key = `${zoneId}_${placement}`;
    const existing = this.analytics.get(key);
    
    if (existing) {
      existing.revenue += amount;
      this.analytics.set(key, existing);
      
      // Send revenue tracking
      this.sendAnalytics('revenue', { zoneId, placement, amount });
    }
  }

  getAnalytics(zoneId?: string): AdAnalytics[] {
    if (zoneId) {
      return Array.from(this.analytics.values()).filter(a => a.zoneId === zoneId);
    }
    return Array.from(this.analytics.values());
  }

  private sendAnalytics(event: string, data: any) {
    try {
      // Send to Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', `ad_${event}`, {
          zone_id: data.zoneId,
          placement: data.placement,
          value: data.amount || 0,
          timestamp: Date.now()
        });
      }

      // Send to custom analytics endpoint (if needed)
      // fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ event, data, timestamp: Date.now() })
      // });
    } catch (error) {
      console.error('Error sending analytics:', error);
    }
  }

  // Batch send analytics every 30 seconds
  startBatchProcessor() {
    setInterval(() => {
      if (this.impressionQueue.length > 0 || this.clickQueue.length > 0) {
        this.processBatch();
      }
    }, 30000);
  }

  private processBatch() {
    try {
      const batch = {
        impressions: [...this.impressionQueue],
        clicks: [...this.clickQueue],
        timestamp: Date.now()
      };

      // Clear queues
      this.impressionQueue = [];
      this.clickQueue = [];

      // Send batch to analytics service
      console.log('Processing analytics batch:', batch);
      
      // Send to external analytics service if needed
      // fetch('/api/analytics/batch', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(batch)
      // });
    } catch (error) {
      console.error('Error processing analytics batch:', error);
    }
  }
}

export const useAdAnalytics = (zoneId: string, placement: string) => {
  const analyticsManager = useRef(AdAnalyticsManager.getInstance()).current;
  const hasTrackedImpression = useRef(false);

  useEffect(() => {
    // Start batch processor if not already started
    analyticsManager.startBatchProcessor();
  }, [analyticsManager]);

  const trackImpression = () => {
    if (!hasTrackedImpression.current) {
      analyticsManager.trackImpression(zoneId, placement);
      hasTrackedImpression.current = true;
    }
  };

  const trackClick = () => {
    analyticsManager.trackClick(zoneId, placement);
  };

  const trackRevenue = (amount: number) => {
    analyticsManager.trackRevenue(zoneId, placement, amount);
  };

  return {
    trackImpression,
    trackClick,
    trackRevenue,
    getAnalytics: () => analyticsManager.getAnalytics(zoneId)
  };
};

export { AdAnalyticsManager };