/**
 * Performance optimization utilities to reduce main thread work
 */

// Debounce function to reduce excessive function calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function to limit function calls
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Schedule non-critical work to avoid blocking main thread
export const scheduleWork = (callback: () => void, options?: { timeout?: number }) => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: options?.timeout || 5000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(callback, 16); // Next frame
  }
};

// Batch DOM reads/writes to avoid layout thrashing
export const batchDOMWork = (() => {
  let reads: (() => void)[] = [];
  let writes: (() => void)[] = [];
  let scheduled = false;

  const flush = () => {
    // Execute all reads first
    reads.forEach(read => read());
    reads = [];
    
    // Then execute all writes
    writes.forEach(write => write());
    writes = [];
    
    scheduled = false;
  };

  return {
    read: (callback: () => void) => {
      reads.push(callback);
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(flush);
      }
    },
    write: (callback: () => void) => {
      writes.push(callback);
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(flush);
      }
    }
  };
})();

// Lazy load images with IntersectionObserver
export const createImageLazyLoader = () => {
  if (typeof window === 'undefined') return null;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  return {
    observe: (img: HTMLImageElement) => imageObserver.observe(img),
    unobserve: (img: HTMLImageElement) => imageObserver.unobserve(img),
    disconnect: () => imageObserver.disconnect()
  };
};

// Split heavy work into chunks to avoid blocking
export const chunkWork = async <T>(
  items: T[],
  processItem: (item: T, index: number) => void | Promise<void>,
  chunkSize: number = 10
): Promise<void> => {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    
    await new Promise<void>((resolve) => {
      scheduleWork(async () => {
        for (let j = 0; j < chunk.length; j++) {
          await processItem(chunk[j], i + j);
        }
        resolve();
      });
    });
  }
};