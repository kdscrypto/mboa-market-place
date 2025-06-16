
import { useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const useGoogleAds = (adSlot: string, adFormat?: string, fullWidthResponsive?: boolean) => {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const loadAd = useCallback(() => {
    if (!adRef.current || isLoaded.current) return;

    try {
      // Ensure adsbygoogle array exists
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Use requestIdleCallback for better performance
        const loadAdCallback = () => {
          try {
            // Push the ad configuration
            window.adsbygoogle.push({});
            isLoaded.current = true;
            
            console.log(`Google Ad loaded for slot: ${adSlot}`);
          } catch (error) {
            console.error('Error pushing to adsbygoogle:', error);
          }
        };

        // Use requestIdleCallback if available, otherwise setTimeout
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadAdCallback, { timeout: 2000 });
        } else {
          timeoutRef.current = setTimeout(loadAdCallback, 100);
        }
      }
    } catch (error) {
      console.error('Error loading Google Ad:', error);
    }
  }, [adSlot]);

  useEffect(() => {
    // Load ad after critical content is rendered
    const loadTimer = setTimeout(() => {
      // Only load if page is idle or after 500ms
      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadAd, { timeout: 1000 });
      } else {
        loadAd();
      }
    }, 500);

    return () => {
      clearTimeout(loadTimer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loadAd]);

  return { adRef };
};
