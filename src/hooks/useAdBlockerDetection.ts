import { useState, useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface AdBlockerDetection {
  isBlocked: boolean;
  isLoading: boolean;
  confidence: number;
}

export const useAdBlockerDetection = (): AdBlockerDetection => {
  const [detection, setDetection] = useState<AdBlockerDetection>({
    isBlocked: false,
    isLoading: true,
    confidence: 0
  });

  useEffect(() => {
    const detectAdBlocker = async () => {
      let blockedCount = 0;
      const totalTests = 5;

      // Test 1: Try to create a typical ad element
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'adsbox adsbygoogle ad-banner';
        testDiv.style.position = 'absolute';
        testDiv.style.left = '-9999px';
        testDiv.style.height = '1px';
        testDiv.style.width = '1px';
        document.body.appendChild(testDiv);
        
        setTimeout(() => {
          if (testDiv.offsetHeight === 0 || testDiv.style.display === 'none') {
            blockedCount++;
          }
          document.body.removeChild(testDiv);
        }, 100);
      } catch (e) {
        blockedCount++;
      }

      // Test 2: Check for common ad blocker properties
      if (typeof window !== 'undefined') {
        // Check if ads-related functions are blocked
        if (!window.adsbygoogle || window.adsbygoogle.length === 0) {
          blockedCount++;
        }

        // Test 3: Check for ad blocker extensions
        if ((window as any).uBlock || (window as any).ABP || (window as any).adblock) {
          blockedCount++;
        }

        // Test 4: Try to access ad-related URLs
        try {
          const img = new Image();
          img.src = 'https://googleads.g.doubleclick.net/pagead/id';
          img.onerror = () => blockedCount++;
        } catch (e) {
          blockedCount++;
        }

        // Test 5: Check for modified fetch/XMLHttpRequest
        const originalFetch = window.fetch;
        if (originalFetch.toString().includes('blocked') || originalFetch.toString().length > 200) {
          blockedCount++;
        }
      }

      // Calculate confidence and determine if blocked
      setTimeout(() => {
        const confidence = (blockedCount / totalTests) * 100;
        const isBlocked = confidence > 60; // 60% confidence threshold

        setDetection({
          isBlocked,
          isLoading: false,
          confidence
        });

        // Track ad blocker detection
        if (isBlocked) {
          console.log(`Ad blocker detected with ${confidence}% confidence`);
          
        // Send analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'ad_blocker_detected', {
            confidence: confidence,
            blocked_tests: blockedCount
          });
        }
        }
      }, 500);
    };

    detectAdBlocker();
  }, []);

  return detection;
};

// Hook for fallback content when ads are blocked
export const useAdFallback = (isBlocked: boolean) => {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (isBlocked) {
      // Show fallback content after a delay to avoid false positives
      const timer = setTimeout(() => {
        setShowFallback(true);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowFallback(false);
    }
  }, [isBlocked]);

  return showFallback;
};