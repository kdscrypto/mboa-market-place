import { useEffect, useRef } from 'react';

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

// Performance-optimized Adsterra manager
class AdsterraManager {
  private static instance: AdsterraManager;
  private loadedScripts: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<void>> = new Map();
  private performanceMetrics = {
    scriptsLoadStartTime: 0,
    scriptsLoadEndTime: 0,
    totalLoadTime: 0
  };

  static getInstance(): AdsterraManager {
    if (!AdsterraManager.instance) {
      AdsterraManager.instance = new AdsterraManager();
    }
    return AdsterraManager.instance;
  }

  // Intelligent script loading with performance monitoring
  async loadScript(src: string): Promise<void> {
    if (this.loadedScripts.has(src)) {
      console.log(`🔄 Adsterra script already loaded: ${src}`);
      return Promise.resolve();
    }

    if (this.loadingPromises.has(src)) {
      console.log(`⏳ Adsterra script loading in progress: ${src}`);
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      // Use requestIdleCallback for non-blocking script injection
      const loadScriptWhenIdle = () => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true; // Additional defer for better performance
        
        // Performance monitoring
        const loadStartTime = performance.now();
        
        script.onload = () => {
          const loadEndTime = performance.now();
          const loadTime = loadEndTime - loadStartTime;
          
          this.loadedScripts.add(src);
          this.loadingPromises.delete(src);
          this.performanceMetrics.totalLoadTime += loadTime;
          
          console.log(`✅ Adsterra script loaded in ${loadTime.toFixed(2)}ms: ${src}`);
          resolve();
        };
        
        script.onerror = (error) => {
          this.loadingPromises.delete(src);
          console.error(`❌ Failed to load Adsterra script: ${src}`, error);
          reject(error);
        };
        
        // Inject script only when browser is idle
        if (document.readyState === 'complete') {
          document.head.appendChild(script);
        } else {
          window.addEventListener('load', () => {
            document.head.appendChild(script);
          });
        }
        
        console.log(`🚀 Loading Adsterra script (deferred): ${src}`);
      };

      // Use requestIdleCallback for optimal performance
      if (window.requestIdleCallback) {
        window.requestIdleCallback(loadScriptWhenIdle, { timeout: 5000 });
      } else {
        setTimeout(loadScriptWhenIdle, 100); // Fallback for older browsers
      }
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  // Enhanced async options initialization with performance checks
  initializeAsyncOptions() {
    if (typeof window !== 'undefined' && window.AdsterraPerformance) {
      if (!window.AdsterraPerformance.isInitialized) {
        window.AdsterraPerformance.init();
      }
      window.atAsyncOptions = window.atAsyncOptions || [];
      window.atOptions = window.atOptions || {};
      console.log('🔧 Performance-optimized Adsterra configuration verified');
    }
  }

  // Get performance metrics for monitoring
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      loadedScriptsCount: this.loadedScripts.size,
      averageLoadTime: this.performanceMetrics.totalLoadTime / this.loadedScripts.size || 0
    };
  }
}

// Performance-optimized base hook
export const useAdsterra = (adConfig: any) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);
  const manager = AdsterraManager.getInstance();

  useEffect(() => {
    if (!adRef.current || isLoaded.current) return;

    const loadAd = () => {
      try {
        manager.initializeAsyncOptions();
        
        // Push the ad configuration
        if (window.atAsyncOptions) {
          window.atAsyncOptions.push(adConfig);
          isLoaded.current = true;
          console.log(`🎯 Adsterra Ad config queued:`, adConfig);
        }
        
        // Load async script with performance optimization
        manager.loadScript('https://www.profitabledisplaycontent.com/assets/js/async.min.js')
          .catch(error => console.error('💥 Error loading Adsterra Ad:', error));
      } catch (error) {
        console.error('💥 Error configuring Adsterra Ad:', error);
      }
    };

    // Queue ad loading through performance system
    if (window.AdsterraPerformance) {
      window.AdsterraPerformance.queueAd(loadAd);
    } else {
      // Fallback if performance system not available
      setTimeout(loadAd, 2000);
    }
  }, [adConfig, manager]);

  return { adRef };
};

// Performance-optimized banner hook
export const useAdsterraBanner = (zoneId: string, format: string = 'banner') => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);
  const manager = AdsterraManager.getInstance();

  useEffect(() => {
    if (!adRef.current || isLoaded.current) return;

    const loadBannerAd = () => {
      try {
        console.log(`🎨 Queuing Adsterra Banner - Zone: ${zoneId}, Format: ${format}`);
        
        // Set up the container with proper attributes first
        if (adRef.current) {
          adRef.current.id = `container-${zoneId}`;
          adRef.current.setAttribute('data-zone', zoneId);
        }
        
        // Initialize global configuration
        manager.initializeAsyncOptions();
        
        const config = {
          key: zoneId,
          format: format,
          height: format === 'banner' ? 250 : (format === 'leaderboard' ? 90 : 600),
          width: format === 'banner' ? 300 : (format === 'leaderboard' ? 728 : 160),
          params: {}
        };
        
        // Push configuration to global array
        if (window.atAsyncOptions) {
          window.atAsyncOptions.push(config);
          console.log(`🔧 Banner config queued:`, config);
        }
        
        // Load the async script with performance optimization
        manager.loadScript('https://www.profitabledisplaycontent.com/assets/js/async.min.js')
          .then(() => {
            isLoaded.current = true;
            console.log(`✅ Adsterra Banner ready for zone: ${zoneId}`);
          })
          .catch(error => console.error('💥 Error loading Adsterra Banner:', error));
        
      } catch (error) {
        console.error('💥 Error configuring Adsterra Banner:', error);
      }
    };

    // Queue banner loading through performance system
    if (window.AdsterraPerformance) {
      window.AdsterraPerformance.queueAd(loadBannerAd);
    } else {
      // Fallback with longer delay for banners
      setTimeout(loadBannerAd, 3000);
    }
  }, [zoneId, format, manager]);

  return { adRef };
};

// Performance-optimized native ads hook
export const useAdsterraNative = (zoneId: string) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);
  const manager = AdsterraManager.getInstance();

  useEffect(() => {
    if (!adRef.current || isLoaded.current) return;

    const loadNativeAd = () => {
      try {
        console.log(`🎯 Queuing Adsterra Native - Zone: ${zoneId}`);
        
        // Set up the container first with the proper ID that Adsterra expects
        if (adRef.current) {
          adRef.current.id = `container-${zoneId}`;
          adRef.current.setAttribute('data-zone', zoneId);
          console.log(`📦 Container configured with ID: container-${zoneId}`);
        }
        
        // Initialize global configuration
        manager.initializeAsyncOptions();
        
        // Load the zone-specific invoke script with performance optimization
        const scriptSrc = `//pl27571954.revenuecpmgate.com/${zoneId}/invoke.js`;
        manager.loadScript(`https:${scriptSrc}`)
          .then(() => {
            isLoaded.current = true;
            console.log(`✅ Adsterra Native Banner ready for zone: ${zoneId}`);
          })
          .catch(error => {
            console.error('💥 Error loading Adsterra Native Banner:', error);
            console.error('Script URL attempted:', `https://pl27571954.revenuecpmgate.com/${zoneId}/invoke.js`);
          });
      } catch (error) {
        console.error('💥 Error configuring Adsterra Native Banner:', error);
      }
    };

    // Queue native ad loading through performance system
    if (window.AdsterraPerformance) {
      window.AdsterraPerformance.queueAd(loadNativeAd);
    } else {
      // Fallback with delay for native ads
      setTimeout(loadNativeAd, 4000);
    }
  }, [zoneId, manager]);

  return { adRef };
};

// Performance-optimized social bar hook
export const useAdsterraSocialBar = (zoneId: string) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);
  const manager = AdsterraManager.getInstance();

  useEffect(() => {
    if (!adRef.current || isLoaded.current) return;

    const loadSocialBar = () => {
      try {
        console.log(`🎯 Queuing Adsterra Social Bar - Zone: ${zoneId}`);
        
        // Load the specific social bar script with performance optimization
        const scriptSrc = '//pl27571971.revenuecpmgate.com/fe/10/e6/fe10e69177de8cccddb46f67064b9c9b.js';
        manager.loadScript(`https:${scriptSrc}`)
          .then(() => {
            isLoaded.current = true;
            console.log(`✅ Adsterra Social Bar ready for zone: ${zoneId}`);
          })
          .catch(error => console.error('💥 Error loading Adsterra Social Bar:', error));
      } catch (error) {
        console.error('💥 Error configuring Adsterra Social Bar:', error);
      }
    };

    // Queue social bar loading through performance system (mobile-specific timing)
    if (window.AdsterraPerformance) {
      window.AdsterraPerformance.queueAd(loadSocialBar);
    } else {
      // Fallback with longer delay for social bars (mobile optimization)
      setTimeout(loadSocialBar, 5000);
    }
  }, [zoneId, manager]);

  return { adRef };
};