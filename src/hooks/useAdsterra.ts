import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    atAsyncOptions?: any[];
    atOptions?: any;
  }
}

export const useAdsterra = (adConfig: any) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (!adRef.current || isLoaded.current) return;

    try {
      // Ensure atAsyncOptions array exists
      if (typeof window !== 'undefined') {
        window.atAsyncOptions = window.atAsyncOptions || [];
        
        // Push the ad configuration
        window.atAsyncOptions.push(adConfig);
        isLoaded.current = true;
        
        // Load Adsterra script if not already loaded
        if (!document.querySelector('script[src*="adsterra"]')) {
          const script = document.createElement('script');
          script.src = 'https://www.profitabledisplaycontent.com/assets/js/async.min.js';
          script.async = true;
          document.head.appendChild(script);
        }
        
        console.log(`Adsterra Ad loaded:`, adConfig);
      }
    } catch (error) {
      console.error('Error loading Adsterra Ad:', error);
    }
  }, [adConfig]);

  return { adRef };
};

export const useAdsterraBanner = (zoneId: string, format: string = 'banner') => {
  const config = {
    key: zoneId,
    format: format,
    height: format === 'banner' ? 250 : 300,
    width: format === 'banner' ? 300 : 728,
    params: {}
  };
  
  return useAdsterra(config);
};

export const useAdsterraNative = (zoneId: string) => {
  const config = {
    key: zoneId,
    format: 'native',
    native: {
      settings: {
        categories_exclude: [],
        key: zoneId,
        css: {
          'text-color': 'inherit',
          'color': 'inherit',
          'font-family': 'inherit',
          'font-size': 'inherit'
        }
      }
    }
  };
  
  return useAdsterra(config);
};

export const useAdsterraSocialBar = (zoneId: string) => {
  const config = {
    key: zoneId,
    format: 'socialbar',
    socialbar: {
      categories_exclude: [],
      key: zoneId
    }
  };
  
  return useAdsterra(config);
};