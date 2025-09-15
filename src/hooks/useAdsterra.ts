import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    atAsyncOptions?: any[];
    atOptions?: any;
  }
}

// Global Adsterra manager
class AdsterraManager {
  private static instance: AdsterraManager;
  private loadedScripts: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  static getInstance(): AdsterraManager {
    if (!AdsterraManager.instance) {
      AdsterraManager.instance = new AdsterraManager();
    }
    return AdsterraManager.instance;
  }

  async loadScript(src: string): Promise<void> {
    if (this.loadedScripts.has(src)) {
      console.log(`Adsterra script already loaded: ${src}`);
      return Promise.resolve();
    }

    if (this.loadingPromises.has(src)) {
      console.log(`Adsterra script loading in progress: ${src}`);
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => {
        this.loadedScripts.add(src);
        this.loadingPromises.delete(src);
        console.log(`✅ Adsterra script loaded successfully: ${src}`);
        resolve();
      };
      
      script.onerror = (error) => {
        this.loadingPromises.delete(src);
        console.error(`❌ Failed to load Adsterra script: ${src}`, error);
        reject(error);
      };
      
      document.head.appendChild(script);
      console.log(`🔄 Loading Adsterra script: ${src}`);
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  initializeAsyncOptions() {
    if (typeof window !== 'undefined') {
      window.atAsyncOptions = window.atAsyncOptions || [];
      console.log('🔧 Adsterra atAsyncOptions initialized');
    }
  }
}

export const useAdsterra = (adConfig: any) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);
  const manager = AdsterraManager.getInstance();

  useEffect(() => {
    if (!adRef.current || isLoaded.current) return;

    const loadAd = async () => {
      try {
        manager.initializeAsyncOptions();
        
        // Push the ad configuration
        window.atAsyncOptions!.push(adConfig);
        isLoaded.current = true;
        
        console.log(`🎯 Adsterra Ad config pushed:`, adConfig);
        
        // Load async script if not already loaded
        await manager.loadScript('https://www.profitabledisplaycontent.com/assets/js/async.min.js');
        
      } catch (error) {
        console.error('💥 Error loading Adsterra Ad:', error);
      }
    };

    loadAd();
  }, [adConfig, manager]);

  return { adRef };
};

export const useAdsterraBanner = (zoneId: string, format: string = 'banner') => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);
  const manager = AdsterraManager.getInstance();

  useEffect(() => {
    if (!adRef.current || isLoaded.current) return;

    const loadBannerAd = async () => {
      try {
        console.log(`🎨 Initializing Adsterra Banner - Zone: ${zoneId}, Format: ${format}`);
        
        // Set up the container with proper attributes
        if (adRef.current) {
          adRef.current.id = `container-${zoneId}`;
          adRef.current.setAttribute('data-zone', zoneId);
        }
        
        // Initialize atAsyncOptions for banner ads
        manager.initializeAsyncOptions();
        
        const config = {
          key: zoneId,
          format: format,
          height: format === 'banner' ? 250 : (format === 'leaderboard' ? 90 : 600),
          width: format === 'banner' ? 300 : (format === 'leaderboard' ? 728 : 160),
          params: {}
        };
        
        // Push configuration
        window.atAsyncOptions!.push(config);
        
        // Load the async script
        await manager.loadScript('https://www.profitabledisplaycontent.com/assets/js/async.min.js');
        
        isLoaded.current = true;
        console.log(`✅ Adsterra Banner initialized for zone: ${zoneId}`);
        
      } catch (error) {
        console.error('💥 Error loading Adsterra Banner:', error);
      }
    };

    loadBannerAd();
  }, [zoneId, format, manager]);

  return { adRef };
};

export const useAdsterraNative = (zoneId: string) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);
  const manager = AdsterraManager.getInstance();

  useEffect(() => {
    if (!adRef.current || isLoaded.current) return;

    const loadNativeAd = async () => {
      try {
        console.log(`🎯 Initializing Adsterra Native - Zone: ${zoneId}`);
        
        // Use the zoneId to construct the proper script URL
        // This assumes your native ad script follows Adsterra's standard pattern
        const scriptSrc = `//pl27571954.revenuecpmgate.com/${zoneId}/invoke.js`;
        await manager.loadScript(`https:${scriptSrc}`);
        
        // Set up the container with the proper ID that Adsterra expects
        if (adRef.current) {
          adRef.current.id = `container-${zoneId}`;
          console.log(`📦 Container set up with ID: container-${zoneId}`);
        }
        
        isLoaded.current = true;
        console.log(`✅ Adsterra Native Banner initialized for zone: ${zoneId}`);
      } catch (error) {
        console.error('💥 Error loading Adsterra Native Banner:', error);
        console.error('Script URL attempted:', `https://pl27571954.revenuecpmgate.com/${zoneId}/invoke.js`);
      }
    };

    loadNativeAd();
  }, [zoneId, manager]);

  return { adRef };
};

export const useAdsterraSocialBar = (zoneId: string) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);
  const manager = AdsterraManager.getInstance();

  useEffect(() => {
    if (!adRef.current || isLoaded.current) return;

    const loadSocialBar = async () => {
      try {
        console.log(`🎯 Initializing Adsterra Social Bar - Zone: ${zoneId}`);
        
        // Load the specific social bar script
        const scriptSrc = '//pl27571971.revenuecpmgate.com/fe/10/e6/fe10e69177de8cccddb46f67064b9c9b.js';
        await manager.loadScript(`https:${scriptSrc}`);
        
        isLoaded.current = true;
        console.log(`✅ Adsterra Social Bar initialized for zone: ${zoneId}`);
      } catch (error) {
        console.error('💥 Error loading Adsterra Social Bar:', error);
      }
    };

    loadSocialBar();
  }, [zoneId, manager]);

  return { adRef };
};