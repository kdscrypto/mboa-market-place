import { useEffect } from 'react';
import { scheduleTask } from '@/utils/scheduler';

// Critical resource preloader
export const useCriticalResourcePreloader = () => {
  useEffect(() => {
    const preloadResources = () => {
      // Preload critical fonts
      const fonts = [
        '/fonts/inter-latin-400-normal.woff2',
        '/fonts/inter-latin-500-normal.woff2',
        '/fonts/inter-latin-600-normal.woff2'
      ];

      fonts.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = font;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });

      // Preload critical images
      const criticalImages = [
        '/placeholder.svg',
        '/logo.svg'
      ];

      criticalImages.forEach(image => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = image;
        link.as = 'image';
        document.head.appendChild(link);
      });

      // Prefetch likely next pages
      const likelyPages = [
        '/publier-annonce',
        '/messages',
        '/categories'
      ];

      likelyPages.forEach(page => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = page;
        document.head.appendChild(link);
      });
    };

    // Schedule preloading as low priority
    scheduleTask(preloadResources, 'low');
  }, []);
};

// Service Worker registration for caching
export const useServiceWorkerRegistration = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      scheduleTask(async () => {
        try {
          await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered');
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      }, 'low');
    }
  }, []);
};