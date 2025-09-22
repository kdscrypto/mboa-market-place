import { useEffect, useRef } from 'react';
import { useAdsterraLazy } from '@/hooks/useAdsterraLazy';
import { getConfigByZoneId } from '@/config/adsterra';

declare global {
  interface Window {
    atAsyncOptions?: any[];
    atOptions?: any;
    AdsterraPerformance?: {
      isInitialized: boolean;
      isLCPComplete: boolean;
      isIdleTimeReached: boolean;
      pendingAds: Array<() => void>;
      init: () => void;
      queueAd: (adLoader: () => void) => void;
      canLoadAds: () => boolean;
      processPendingAds: () => void;
    };
  }
}

// LEGACY COMPATIBILITY LAYER - Gradually migrate to useAdsterraLazy
// These hooks maintain backward compatibility while using the new system

// Base hook with new system (now uses lazy loading)
export const useAdsterra = (adConfig: any) => {
  console.warn('[DEPRECATED] useAdsterra is deprecated. Use useAdsterraLazy instead for better performance.');
  
  // Extract zone ID from legacy config
  const zoneId = adConfig?.key || adConfig?.zoneId || adConfig;
  
  const { adRef, state } = useAdsterraLazy(zoneId, 'banner');
  
  // Return legacy-compatible interface
  return { adRef };
};

// Enhanced banner hook with lazy loading
export const useAdsterraBanner = (zoneId: string, format: string = 'banner') => {
  const { adRef, state, zoneConfig } = useAdsterraLazy(zoneId, 'banner');
  
  // Log migration recommendation
  useEffect(() => {
    console.info(`[MIGRATION] useAdsterraBanner for zone ${zoneId} - Consider upgrading to LazyAdContainer component for better performance.`);
    
    if (zoneConfig && !zoneConfig.isProduction) {
      console.warn(`[ZONE_WARNING] Zone ${zoneId} is using test configuration. Replace with production zone ID.`);
    }
  }, [zoneId, zoneConfig]);

  return { adRef };
};

// Enhanced native ads hook with lazy loading  
export const useAdsterraNative = (zoneId: string) => {
  const { adRef, state, zoneConfig } = useAdsterraLazy(zoneId, 'native');
  
  // Log migration recommendation
  useEffect(() => {
    console.info(`[MIGRATION] useAdsterraNative for zone ${zoneId} - Consider upgrading to LazyAdContainer component for better performance.`);
    
    if (zoneConfig && !zoneConfig.isProduction) {
      console.warn(`[ZONE_WARNING] Zone ${zoneId} is using test configuration. Replace with production zone ID.`);
    }
  }, [zoneId, zoneConfig]);

  return { adRef };
};

// Enhanced social bar hook with lazy loading
export const useAdsterraSocialBar = (zoneId: string) => {
  const { adRef, state, zoneConfig } = useAdsterraLazy(zoneId, 'social');
  
  // Log migration recommendation  
  useEffect(() => {
    console.info(`[MIGRATION] useAdsterraSocialBar for zone ${zoneId} - Consider upgrading to LazyAdContainer component for better performance.`);
    
    if (zoneConfig && !zoneConfig.isProduction) {
      console.warn(`[ZONE_WARNING] Zone ${zoneId} is using test configuration. Replace with production zone ID.`);
    }
  }, [zoneId, zoneConfig]);

  return { adRef };
};