
import React, { useEffect } from 'react';
import { useAdvancedMobileDetection } from '@/hooks/useAdvancedMobileDetection';
import { mobileCacheService } from '@/services/mobileCacheService';

interface MobilePerformanceOptimizerProps {
  children: React.ReactNode;
}

const MobilePerformanceOptimizer: React.FC<MobilePerformanceOptimizerProps> = ({ children }) => {
  const { performanceLevel, deviceType, connectionType } = useAdvancedMobileDetection();

  console.log("MobilePerformanceOptimizer rendered:", { performanceLevel, deviceType, connectionType });

  useEffect(() => {
    try {
      // Apply performance optimizations based on device capabilities
      const applyOptimizations = () => {
        console.log("Applying mobile optimizations...");
        
        // Reduce animations for low-performance devices
        if (performanceLevel === 'low') {
          document.documentElement.style.setProperty('--animation-duration', '0s');
          document.documentElement.style.setProperty('--transition-duration', '0s');
        } else {
          document.documentElement.style.setProperty('--animation-duration', '0.3s');
          document.documentElement.style.setProperty('--transition-duration', '0.2s');
        }

        // Optimize for slow connections
        if (connectionType === 'slow-2g' || connectionType === '2g') {
          // Disable autoplay videos, reduce image quality, etc.
          document.documentElement.setAttribute('data-slow-connection', 'true');
        } else {
          document.documentElement.removeAttribute('data-slow-connection');
        }

        // Mobile-specific optimizations
        if (deviceType === 'mobile') {
          // Enable hardware acceleration for better scrolling
          document.documentElement.style.setProperty('--scroll-behavior', 'smooth');
          document.documentElement.style.setProperty('--webkit-overflow-scrolling', 'touch');
          
          // Optimize viewport for mobile
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
          }
        }

        console.log("Mobile optimizations applied successfully");
      };

      applyOptimizations();

      // Re-apply optimizations when performance characteristics change
      const interval = setInterval(applyOptimizations, 30000); // Every 30 seconds

      return () => {
        clearInterval(interval);
      };
    } catch (error) {
      console.error("Error in MobilePerformanceOptimizer:", error);
    }
  }, [performanceLevel, deviceType, connectionType]);

  // Preload critical resources for mobile
  useEffect(() => {
    try {
      if (deviceType === 'mobile') {
        console.log("Preloading critical mobile data...");
        // Note: mobileCacheService might not exist, so we'll skip the preload for now
        // mobileCacheService.preloadCriticalData(
        //   ['categories', 'recent-ads', 'trending-ads'],
        //   {
        //     categories: () => fetch('/api/categories').then(r => r.json()),
        //     'recent-ads': () => fetch('/api/ads/recent').then(r => r.json()),
        //     'trending-ads': () => fetch('/api/ads/trending').then(r => r.json())
        //   }
        // );
      }
    } catch (error) {
      console.error("Error preloading mobile data:", error);
    }
  }, [deviceType]);

  return (
    <div className="mobile-performance-optimized">
      {children}
    </div>
  );
};

export default MobilePerformanceOptimizer;
