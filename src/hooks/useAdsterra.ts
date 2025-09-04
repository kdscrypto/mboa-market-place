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
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (!adRef.current || isLoaded.current) return;

    try {
      if (typeof window !== 'undefined') {
        // Load the specific native banner script
        if (!document.querySelector('script[src*="723f32db77c60f4499146c57ce5844c2"]')) {
          const script = document.createElement('script');
          script.async = true;
          script.setAttribute('data-cfasync', 'false');
          script.src = '//pl27571954.revenuecpmgate.com/723f32db77c60f4499146c57ce5844c2/invoke.js';
          document.head.appendChild(script);
        }
        
        isLoaded.current = true;
        console.log(`Adsterra Native Banner loaded for zone: ${zoneId}`);
      }
    } catch (error) {
      console.error('Error loading Adsterra Native Banner:', error);
    }
  }, [zoneId]);

  return { adRef };
};

export const useAdsterraSocialBar = (zoneId: string) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (!adRef.current || isLoaded.current) return;

    try {
      if (typeof window !== 'undefined') {
        // Load the specific social bar script
        if (!document.querySelector('script[src*="fe10e69177de8cccddb46f67064b9c9b"]')) {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = '//pl27571971.revenuecpmgate.com/fe/10/e6/fe10e69177de8cccddb46f67064b9c9b.js';
          document.head.appendChild(script);
        }
        
        isLoaded.current = true;
        console.log(`Adsterra Social Bar loaded for zone: ${zoneId}`);
      }
    } catch (error) {
      console.error('Error loading Adsterra Social Bar:', error);
    }
  }, [zoneId]);

  return { adRef };
};