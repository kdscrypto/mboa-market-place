
interface CacheConfig {
  maxAge: number;
  maxSize: number;
  strategy: 'lru' | 'fifo';
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

class AdvancedCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxAge: 1000 * 60 * 15, // 15 minutes
      maxSize: 100,
      strategy: 'lru',
      ...config
    };
  }

  set(key: string, data: T): void {
    const now = Date.now();
    
    // Remove expired items
    this.cleanup();
    
    // Remove oldest item if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if expired
    if (Date.now() - item.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Update access stats
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.config.maxAge) {
        this.cache.delete(key);
      }
    }
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToRemove: string;
    
    if (this.config.strategy === 'lru') {
      // Remove least recently used
      let oldestTime = Infinity;
      keyToRemove = '';
      
      for (const [key, item] of this.cache.entries()) {
        if (item.lastAccessed < oldestTime) {
          oldestTime = item.lastAccessed;
          keyToRemove = key;
        }
      }
    } else {
      // FIFO - remove oldest by timestamp
      let oldestTime = Infinity;
      keyToRemove = '';
      
      for (const [key, item] of this.cache.entries()) {
        if (item.timestamp < oldestTime) {
          oldestTime = item.timestamp;
          keyToRemove = key;
        }
      }
    }

    this.cache.delete(keyToRemove);
  }
}

// Global cache instances
export const imageCache = new AdvancedCache<string>({
  maxAge: 1000 * 60 * 30, // 30 minutes
  maxSize: 200,
  strategy: 'lru'
});

export const apiCache = new AdvancedCache<any>({
  maxAge: 1000 * 60 * 5, // 5 minutes
  maxSize: 50,
  strategy: 'lru'
});

export const staticCache = new AdvancedCache<string>({
  maxAge: 1000 * 60 * 60, // 1 hour
  maxSize: 100,
  strategy: 'fifo'
});
