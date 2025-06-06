
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const useGoogleAds = (adSlot: string, adFormat?: string, fullWidthResponsive?: boolean) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (!adRef.current || isLoaded.current) return;

    try {
      // Ensure adsbygoogle array exists
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Push the ad configuration
        window.adsbygoogle.push({});
        isLoaded.current = true;
        
        console.log(`Google Ad loaded for slot: ${adSlot}`);
      }
    } catch (error) {
      console.error('Error loading Google Ad:', error);
    }
  }, [adSlot]);

  return { adRef };
};
