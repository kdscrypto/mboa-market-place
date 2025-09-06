import { scheduleTask } from './scheduler';

// Resource hints and preloading utilities
class ResourceOptimizer {
  private preloadedResources = new Set<string>();
  private resourceQueue: Array<{ url: string; type: string; priority: 'high' | 'low' }> = [];
  private isProcessing = false;

  // Preload critical resources
  preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font' = 'script', priority: 'high' | 'low' = 'high') {
    if (this.preloadedResources.has(url)) {
      return;
    }

    this.resourceQueue.push({ url, type, priority });
    this.processQueue();
  }

  // Prefetch non-critical resources
  prefetchResource(url: string) {
    if (this.preloadedResources.has(url)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    scheduleTask(() => {
      document.head.appendChild(link);
      this.preloadedResources.add(url);
    }, 'low');
  }

  // DNS prefetch for external domains
  dnsPrefetch(domain: string) {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  }

  // Preconnect to critical external resources
  preconnect(url: string, crossorigin: boolean = false) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    if (crossorigin) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  }

  // Optimize images with lazy loading and responsive formats
  optimizeImage(img: HTMLImageElement, options: {
    webpFallback?: boolean;
    lazyLoad?: boolean;
    sizes?: string;
    placeholder?: string;
  } = {}) {
    const { webpFallback = true, lazyLoad = true, sizes, placeholder } = options;

    if (lazyLoad) {
      img.loading = 'lazy';
    }

    if (sizes) {
      img.sizes = sizes;
    }

    if (placeholder) {
      img.style.backgroundImage = `url('${placeholder}')`;
      img.style.backgroundSize = 'cover';
      img.style.backgroundPosition = 'center';
    }

    // Add WebP support detection
    if (webpFallback && this.supportsWebP()) {
      const src = img.src;
      if (src && !src.includes('.webp')) {
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        img.src = webpSrc;
        
        // Fallback to original if WebP fails
        img.onerror = () => {
          img.src = src;
        };
      }
    }
  }

  // Font optimization
  optimizeFonts() {
    // Add font-display: swap to existing fonts
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: swap;
      }
    `;
    document.head.appendChild(style);

    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-var.woff2',
      '/fonts/inter-regular.woff2'
    ];

    criticalFonts.forEach(font => {
      this.preloadResource(font, 'font', 'high');
    });
  }

  // Critical CSS inlining
  inlineCriticalCSS(css: string) {
    const style = document.createElement('style');
    style.innerHTML = css;
    style.setAttribute('data-critical', 'true');
    document.head.appendChild(style);
  }

  // Load non-critical CSS asynchronously
  loadAsyncCSS(href: string) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  }

  // Bundle analysis and chunk optimization
  analyzeBundle() {
    if (process.env.NODE_ENV === 'development') {
      // Analyze loaded chunks
      const scripts = document.querySelectorAll('script[src]');
      const chunks = Array.from(scripts).map(script => ({
        src: (script as HTMLScriptElement).src,
        size: this.estimateScriptSize(script as HTMLScriptElement)
      }));

      console.group('Bundle Analysis');
      console.table(chunks);
      console.groupEnd();
    }
  }

  // Service Worker integration for advanced caching
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }

  // Memory optimization
  cleanupUnusedResources() {
    // Remove unused stylesheets
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach(sheet => {
      const href = (sheet as HTMLLinkElement).href;
      if (href && !this.isStylesheetUsed(sheet as HTMLLinkElement)) {
        console.log('Removing unused stylesheet:', href);
        sheet.remove();
      }
    });
  }

  private processQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    scheduleTask(() => {
      // Process high priority first
      const highPriority = this.resourceQueue.filter(r => r.priority === 'high');
      const lowPriority = this.resourceQueue.filter(r => r.priority === 'low');

      [...highPriority, ...lowPriority].forEach(resource => {
        this.createPreloadLink(resource.url, resource.type);
      });

      this.resourceQueue = [];
      this.isProcessing = false;
    }, 'normal');
  }

  private createPreloadLink(url: string, type: string) {
    if (this.preloadedResources.has(url)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;

    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'image':
        link.as = 'image';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
    }

    document.head.appendChild(link);
    this.preloadedResources.add(url);
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  }

  private estimateScriptSize(script: HTMLScriptElement): string {
    // This is a rough estimation
    return 'Unknown (use DevTools for accurate size)';
  }

  private isStylesheetUsed(sheet: HTMLLinkElement): boolean {
    // Simple heuristic - in production, you'd want more sophisticated detection
    return true; // Conservative approach - don't remove anything
  }
}

// Singleton instance
export const resourceOptimizer = new ResourceOptimizer();

// React hook for resource optimization
export const useResourceOptimizer = () => {
  return {
    preloadResource: (url: string, type?: 'script' | 'style' | 'image' | 'font', priority?: 'high' | 'low') => 
      resourceOptimizer.preloadResource(url, type, priority),
    prefetchResource: (url: string) => resourceOptimizer.prefetchResource(url),
    dnsPrefetch: (domain: string) => resourceOptimizer.dnsPrefetch(domain),
    preconnect: (url: string, crossorigin?: boolean) => resourceOptimizer.preconnect(url, crossorigin),
    optimizeImage: (img: HTMLImageElement, options?: any) => resourceOptimizer.optimizeImage(img, options),
    optimizeFonts: () => resourceOptimizer.optimizeFonts(),
    inlineCriticalCSS: (css: string) => resourceOptimizer.inlineCriticalCSS(css),
    loadAsyncCSS: (href: string) => resourceOptimizer.loadAsyncCSS(href),
    analyzeBundle: () => resourceOptimizer.analyzeBundle(),
    registerServiceWorker: () => resourceOptimizer.registerServiceWorker(),
    cleanupUnusedResources: () => resourceOptimizer.cleanupUnusedResources()
  };
};