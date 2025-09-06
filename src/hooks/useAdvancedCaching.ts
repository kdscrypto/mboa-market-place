import { useCallback, useRef, useEffect } from 'react';
import { scheduleTask } from '@/utils/scheduler';

// Advanced caching strategy with TTL and memory management
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  persistToDisk?: boolean; // Persist to localStorage
  compressionEnabled?: boolean;
}

class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private options: Required<CacheOptions>;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      persistToDisk: options.persistToDisk || false,
      compressionEnabled: options.compressionEnabled || false
    };

    this.startCleanup();
    this.loadFromDisk();
  }

  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.options.ttl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Enforce size limit using LRU
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);

    if (this.options.persistToDisk) {
      scheduleTask(() => this.saveToDisk(key, entry), 'low');
    }
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      if (this.options.persistToDisk) {
        this.removeFromDisk(key);
      }
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted && this.options.persistToDisk) {
      this.removeFromDisk(key);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    if (this.options.persistToDisk) {
      this.clearDisk();
    }
  }

  size(): number {
    return this.cache.size;
  }

  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      totalAccessCount: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      averageAge: entries.reduce((sum, entry) => sum + (Date.now() - entry.timestamp), 0) / entries.length,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      scheduleTask(() => this.cleanup(), 'low');
    }, 60000); // Cleanup every minute
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.delete(key));
  }

  private loadFromDisk(): void {
    if (!this.options.persistToDisk || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem('advanced-cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const [key, entry] of Object.entries(parsed)) {
          this.cache.set(key, entry as CacheEntry<T>);
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from disk:', error);
    }
  }

  private saveToDisk(key: string, entry: CacheEntry<T>): void {
    if (!this.options.persistToDisk || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const existing = localStorage.getItem('advanced-cache');
      const cache = existing ? JSON.parse(existing) : {};
      cache[key] = entry;
      localStorage.setItem('advanced-cache', JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to save cache to disk:', error);
    }
  }

  private removeFromDisk(key: string): void {
    if (!this.options.persistToDisk || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const existing = localStorage.getItem('advanced-cache');
      if (existing) {
        const cache = JSON.parse(existing);
        delete cache[key];
        localStorage.setItem('advanced-cache', JSON.stringify(cache));
      }
    } catch (error) {
      console.warn('Failed to remove from disk cache:', error);
    }
  }

  private clearDisk(): void {
    if (!this.options.persistToDisk || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem('advanced-cache');
    } catch (error) {
      console.warn('Failed to clear disk cache:', error);
    }
  }

  private estimateMemoryUsage(): number {
    return JSON.stringify(Object.fromEntries(this.cache)).length * 2; // Rough estimate
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// React hook for advanced caching
export const useAdvancedCache = <T>(options?: CacheOptions) => {
  const cacheRef = useRef<AdvancedCache<T> | null>(null);

  if (!cacheRef.current) {
    cacheRef.current = new AdvancedCache<T>(options);
  }

  useEffect(() => {
    return () => {
      if (cacheRef.current) {
        cacheRef.current.destroy();
      }
    };
  }, []);

  const set = useCallback((key: string, data: T, ttl?: number) => {
    cacheRef.current?.set(key, data, ttl);
  }, []);

  const get = useCallback((key: string) => {
    return cacheRef.current?.get(key) || null;
  }, []);

  const has = useCallback((key: string) => {
    return cacheRef.current?.has(key) || false;
  }, []);

  const remove = useCallback((key: string) => {
    return cacheRef.current?.delete(key) || false;
  }, []);

  const clear = useCallback(() => {
    cacheRef.current?.clear();
  }, []);

  const getStats = useCallback(() => {
    return cacheRef.current?.getStats();
  }, []);

  return {
    set,
    get,
    has,
    remove,
    clear,
    getStats
  };
};

// Memoization hook with advanced caching
export const useMemoizedWithCache = <T>(
  factory: () => T,
  deps: React.DependencyList,
  cacheKey: string,
  options?: CacheOptions
): T => {
  const cache = useAdvancedCache<T>(options);
  
  const depsKey = `${cacheKey}-${JSON.stringify(deps)}`;
  
  const cached = cache.get(depsKey);
  if (cached !== null) {
    return cached;
  }

  const result = factory();
  cache.set(depsKey, result);
  
  return result;
};