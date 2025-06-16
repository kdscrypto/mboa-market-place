
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
        
        // Delay ad loading slightly to improve page performance
        timeoutRef.current = setTimeout(() => {
          try {
            // Push the ad configuration
            window.adsbygoogle.push({});
            isLoaded.current = true;
            
            console.log(`Google Ad loaded for slot: ${adSlot}`);
          } catch (error) {
            console.error('Error pushing to adsbygoogle:', error);
          }
        }, 100); // Small delay to let critical content load first
      }
    } catch (error) {
      console.error('Error loading Google Ad:', error);
    }
  }, [adSlot]);

  useEffect(() => {
    // Load ad after a short delay to prioritize critical content
    const loadTimer = setTimeout(loadAd, 200);

    return () => {
      clearTimeout(loadTimer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loadAd]);

  return { adRef };
};
