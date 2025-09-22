// PHASE 3: Performance-optimized lazy loading with Intersection Observer
import { useEffect, useRef, useState, useCallback } from 'react';
import { AdsterraZoneValidator, AdsterraUrlMapper, getConfigByZoneId, type AdsterraZoneConfig } from '@/config/adsterra';
import { useAdAnalytics } from './useAdAnalytics';
import { useAdPerformanceMonitor } from './useAdPerformanceMonitor';

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

interface AdLoadState {
  isVisible: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  hasContent: boolean;
  hasError: boolean;
  retryCount: number;
  loadStartTime: number | null;
  loadEndTime: number | null;
}

interface AdsterraManagerConfig {
  enableIntersectionObserver: boolean;
  visibilityThreshold: number;
  loadRetryCount: number;
  retryDelay: number;
  contentCheckInterval: number;
  contentCheckTimeout: number;
}

const DEFAULT_CONFIG: AdsterraManagerConfig = {
  enableIntersectionObserver: true,
  visibilityThreshold: 0.1,
  loadRetryCount: 3,
  retryDelay: 2000,
  contentCheckInterval: 500,
  contentCheckTimeout: 30000
};

// Enhanced script manager with retry and error handling
class LazyAdsterraManager {
  private static instance: LazyAdsterraManager;
  private loadedScripts: Map<string, { loaded: boolean; loading: Promise<void> | null; error: Error | null }> = new Map();
  private intersectionObserver: IntersectionObserver | null = null;
  private config: AdsterraManagerConfig;
  
  constructor(config: AdsterraManagerConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.initializeIntersectionObserver();
  }

  static getInstance(config?: AdsterraManagerConfig): LazyAdsterraManager {
    if (!LazyAdsterraManager.instance) {
      LazyAdsterraManager.instance = new LazyAdsterraManager(config);
    }
    return LazyAdsterraManager.instance;
  }

  private initializeIntersectionObserver() {
    if (!this.config.enableIntersectionObserver || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const callback = (element as any).__adsterraVisibilityCallback;
          
          if (callback && typeof callback === 'function') {
            callback(entry.isIntersecting, entry.intersectionRatio);
          }
        });
      },
      {
        threshold: this.config.visibilityThreshold,
        rootMargin: '50px'
      }
    );
  }

  observeElement(element: HTMLElement, callback: (isVisible: boolean, ratio: number) => void) {
    if (!this.intersectionObserver) {
      // Fallback: assume visible
      setTimeout(() => callback(true, 1), 100);
      return;
    }

    (element as any).__adsterraVisibilityCallback = callback;
    this.intersectionObserver.observe(element);
  }

  unobserveElement(element: HTMLElement) {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
      delete (element as any).__adsterraVisibilityCallback;
    }
  }

  async loadScript(url: string, retryCount: number = this.config.loadRetryCount): Promise<void> {
    const existingScript = this.loadedScripts.get(url);
    
    if (existingScript) {
      if (existingScript.loaded) {
        return Promise.resolve();
      }
      if (existingScript.loading) {
        return existingScript.loading;
      }
      if (existingScript.error && retryCount <= 0) {
        throw existingScript.error;
      }
    }

    const loadPromise = this.createLoadPromise(url);
    this.loadedScripts.set(url, { loaded: false, loading: loadPromise, error: null });

    try {
      await loadPromise;
      this.loadedScripts.set(url, { loaded: true, loading: null, error: null });
      console.log(`✅ Adsterra script loaded successfully: ${url}`);
    } catch (error) {
      console.error(`❌ Failed to load Adsterra script (attempt ${this.config.loadRetryCount - retryCount + 1}): ${url}`, error);
      
      this.loadedScripts.set(url, { loaded: false, loading: null, error: error as Error });
      
      if (retryCount > 0) {
        console.log(`🔄 Retrying in ${this.config.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        return this.loadScript(url, retryCount - 1);
      }
      
      throw error;
    }
  }

  private createLoadPromise(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.defer = true;

      const timeout = setTimeout(() => {
        reject(new Error(`Script load timeout: ${url}`));
      }, 10000);

      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };

      script.onerror = (error) => {
        clearTimeout(timeout);
        reject(new Error(`Script load error: ${url}`));
      };

      // Use requestIdleCallback for non-blocking insertion
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          document.head.appendChild(script);
        }, { timeout: 1000 });
      } else {
        setTimeout(() => {
          document.head.appendChild(script);
        }, 100);
      }
    });
  }

  getScriptStatus(url: string) {
    return this.loadedScripts.get(url) || { loaded: false, loading: null, error: null };
  }
}

// Enhanced lazy loading hook with intersection observer
export const useAdsterraLazy = (zoneKeyOrId: string, adType: 'banner' | 'native' | 'social' = 'banner') => {
  const adRef = useRef<HTMLDivElement>(null);
  
  // Integrate analytics and performance monitoring
  const { trackImpression, trackClick, trackLoad, trackError } = useAdAnalytics(zoneKeyOrId, `lazy_${adType}`);
  const { trackAdLoadStart, trackAdLoadEnd } = useAdPerformanceMonitor();
  const [state, setState] = useState<AdLoadState>({
    isVisible: false,
    isLoading: false,
    isLoaded: false,
    hasContent: false,
    hasError: false,
    retryCount: 0,
    loadStartTime: null,
    loadEndTime: null
  });

  const manager = LazyAdsterraManager.getInstance();
  const contentCheckRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  // Get configuration for the zone
  const zoneConfig = getConfigByZoneId(zoneKeyOrId) || 
    AdsterraZoneValidator.getZoneConfig(zoneKeyOrId);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Enhanced content detection
  const checkForContent = useCallback(() => {
    if (!adRef.current || !mountedRef.current) return;

    const hasAnyContent = 
      adRef.current.children.length > 0 ||
      adRef.current.innerHTML.trim().length > 0 ||
      adRef.current.querySelector('script, iframe, ins, div[id*="adsterra"]') !== null;

    if (hasAnyContent && !state.hasContent) {
      setState(prev => ({
        ...prev,
        hasContent: true,
        loadEndTime: performance.now()
      }));

      console.log(`✅ Content detected for zone: ${zoneKeyOrId}`);
      
      if (contentCheckRef.current) {
        clearInterval(contentCheckRef.current);
      }
    }
  }, [zoneKeyOrId, state.hasContent]);

  // Start content monitoring
  const startContentMonitoring = useCallback(() => {
    if (contentCheckRef.current) {
      clearInterval(contentCheckRef.current);
    }

    contentCheckRef.current = setInterval(checkForContent, DEFAULT_CONFIG.contentCheckInterval);

    // Stop monitoring after timeout
    setTimeout(() => {
      if (contentCheckRef.current) {
        clearInterval(contentCheckRef.current);
        
        if (!state.hasContent && mountedRef.current) {
          console.warn(`⚠️ No content detected after timeout for zone: ${zoneKeyOrId}`);
          setState(prev => ({ ...prev, hasError: true }));
        }
      }
    }, DEFAULT_CONFIG.contentCheckTimeout);
  }, [checkForContent, zoneKeyOrId, state.hasContent]);

  // Load ad when visible
  const loadAd = useCallback(async () => {
    if (!zoneConfig || state.isLoading || state.isLoaded) return;

    setState(prev => ({ 
      ...prev, 
      isLoading: true,
      loadStartTime: performance.now(),
      hasError: false
    }));

    try {
      console.log(`🚀 Loading ad for zone: ${zoneKeyOrId} (${zoneConfig.type})`);

      // Set up container
      if (adRef.current) {
        adRef.current.id = `container-${zoneConfig.id}`;
        adRef.current.setAttribute('data-zone', zoneConfig.id);
        adRef.current.setAttribute('data-placement', zoneConfig.placement);
      }

      // Initialize global configuration
      if (window.AdsterraPerformance && !window.AdsterraPerformance.isInitialized) {
        window.AdsterraPerformance.init();
      }
      
      window.atAsyncOptions = window.atAsyncOptions || [];
      window.atOptions = window.atOptions || {};

      // Configure based on ad type
      if (zoneConfig.type === 'banner') {
        const config = {
          key: zoneConfig.id,
          format: 'banner',
          height: zoneConfig.dimensions?.height || 250,
          width: zoneConfig.dimensions?.width || 300,
          params: {}
        };
        
        window.atAsyncOptions.push(config);
        console.log(`🔧 Banner config pushed:`, config);
      }

      // Get script URL and load
      const scriptUrl = AdsterraUrlMapper.getScriptUrl(zoneConfig);
      await manager.loadScript(scriptUrl);

      setState(prev => ({ ...prev, isLoaded: true, isLoading: false }));
      startContentMonitoring();

      console.log(`✅ Ad loaded successfully for zone: ${zoneKeyOrId}`);

    } catch (error) {
      console.error(`💥 Error loading ad for zone: ${zoneKeyOrId}`, error);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        hasError: true,
        retryCount: prev.retryCount + 1
      }));

      // Auto-retry if under limit
      if (state.retryCount < DEFAULT_CONFIG.loadRetryCount) {
        setTimeout(() => {
          if (mountedRef.current) {
            setState(prev => ({ ...prev, hasError: false }));
            loadAd();
          }
        }, DEFAULT_CONFIG.retryDelay * (state.retryCount + 1));
      }
    }
  }, [zoneConfig, zoneKeyOrId, state, startContentMonitoring, manager]);

  // Handle visibility changes
  const handleVisibilityChange = useCallback((isVisible: boolean, ratio: number) => {
    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, isVisible }));

    if (isVisible && !state.isLoaded && !state.isLoading && !state.hasError) {
      // Add delay if configured
      const delay = zoneConfig?.loadDelay || 0;
      
      if (delay > 0) {
        setTimeout(() => {
          if (mountedRef.current && state.isVisible) {
            loadAd();
          }
        }, delay);
      } else {
        loadAd();
      }
    }
  }, [state, zoneConfig, loadAd]);

  // Set up intersection observer
  useEffect(() => {
    if (!adRef.current) return;

    manager.observeElement(adRef.current, handleVisibilityChange);

    return () => {
      if (adRef.current) {
        manager.unobserveElement(adRef.current);
      }
      if (contentCheckRef.current) {
        clearInterval(contentCheckRef.current);
      }
    };
  }, [handleVisibilityChange, manager]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (contentCheckRef.current) {
        clearInterval(contentCheckRef.current);
      }
      mountedRef.current = false;
    };
  }, []);

  return {
    adRef,
    state,
    zoneConfig,
    retryLoad: () => {
      if (mountedRef.current) {
        setState(prev => ({ ...prev, hasError: false, retryCount: 0 }));
        loadAd();
      }
    }
  };
};