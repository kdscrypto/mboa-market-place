/**
 * Time slicing utilities to break up long-running tasks and improve FID
 */

// Yield control to the browser to process user input
export const yieldToMain = (): Promise<void> => {
  return new Promise(resolve => {
    // Use scheduler.postTask if available (Chrome 94+)
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      (window as any).scheduler.postTask(resolve, { priority: 'user-blocking' });
    } else {
      // Fallback to MessageChannel for immediate yielding
      const channel = new MessageChannel();
      channel.port2.onmessage = () => resolve();
      channel.port1.postMessage(null);
    }
  });
};

// Process array items with yielding between chunks
export const processWithYielding = async <T, R>(
  items: T[],
  processor: (item: T) => R | Promise<R>,
  chunkSize: number = 5
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    
    // Process chunk
    for (const item of chunk) {
      const result = await processor(item);
      results.push(result);
    }
    
    // Yield to main thread after each chunk (except the last one)
    if (i + chunkSize < items.length) {
      await yieldToMain();
    }
  }
  
  return results;
};

// Debounced function that yields control
export const createYieldingDebounce = <T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await yieldToMain();
      fn(...args);
    }, delay);
  }) as T;
};

// Task scheduler for breaking up work
export class TaskScheduler {
  private tasks: (() => void | Promise<void>)[] = [];
  private isRunning = false;
  private abortController?: AbortController;

  add(task: () => void | Promise<void>) {
    this.tasks.push(task);
    if (!this.isRunning) {
      this.run();
    }
  }

  private async run() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.abortController = new AbortController();
    
    try {
      while (this.tasks.length > 0 && !this.abortController.signal.aborted) {
        const task = this.tasks.shift();
        if (task) {
          await task();
          // Yield after each task
          await yieldToMain();
        }
      }
    } catch (error) {
      console.error('Task scheduler error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  clear() {
    this.tasks = [];
    this.abortController?.abort();
    this.isRunning = false;
  }
}

// Global task scheduler instance
export const globalTaskScheduler = new TaskScheduler();

// Helper to defer non-critical work
export const deferNonCriticalWork = (callback: () => void | Promise<void>) => {
  globalTaskScheduler.add(callback);
};

// Intersection Observer with yielding for better performance
export const createYieldingIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void | Promise<void>,
  options?: IntersectionObserverInit
) => {
  return new IntersectionObserver(async (entries) => {
    // Process entries in chunks to avoid long tasks
    await processWithYielding(entries, async (entry) => {
      await callback([entry]);
    }, 3);
  }, options);
};