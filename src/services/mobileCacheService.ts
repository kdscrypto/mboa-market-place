
class MobileCacheService {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private maxCacheSize: number;
  private defaultTTL: number;

  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100; // Limit cache size for mobile devices
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
    
    // Clear expired items periodically
    setInterval(() => {
      this.clearExpired();
    }, 60000); // Every minute
  }

  set(key: string, data: any, ttl?: number): void {
    // Check cache size and remove oldest items if necessary
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Memory management for mobile devices
  getMemoryUsage(): { used: number; limit: number } {
    const memoryInfo = (performance as any).memory;
    if (memoryInfo) {
      return {
        used: memoryInfo.usedJSHeapSize,
        limit: memoryInfo.jsHeapSizeLimit
      };
    }
    return { used: 0, limit: 0 };
  }

  // Adaptive cache management based on device performance
  adaptCacheSize(): void {
    const memoryInfo = this.getMemoryUsage();
    const memoryUsageRatio = memoryInfo.used / memoryInfo.limit;
    
    if (memoryUsageRatio > 0.8) {
      // High memory usage, reduce cache size
      this.maxCacheSize = Math.max(25, this.maxCacheSize - 10);
      this.clearOldestItems();
    } else if (memoryUsageRatio < 0.5) {
      // Low memory usage, can increase cache size
      this.maxCacheSize = Math.min(150, this.maxCacheSize + 5);
    }
  }

  private clearOldestItems(): void {
    const itemsToRemove = this.cache.size - this.maxCacheSize;
    if (itemsToRemove > 0) {
      const keys = Array.from(this.cache.keys()).slice(0, itemsToRemove);
      keys.forEach(key => this.cache.delete(key));
    }
  }

  // Preload critical data for mobile
  async preloadCriticalData(keys: string[], dataFetchers: Record<string, () => Promise<any>>): Promise<void> {
    const promises = keys.map(async (key) => {
      if (!this.has(key) && dataFetchers[key]) {
        try {
          const data = await dataFetchers[key]();
          this.set(key, data, this.defaultTTL * 2); // Longer TTL for preloaded data
        } catch (error) {
          console.warn(`Failed to preload data for key: ${key}`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }
}

export const mobileCacheService = new MobileCacheService();
