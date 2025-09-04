/**
 * Utilities for scheduling tasks to minimize main thread blocking
 */

export const scheduleTask = (task: () => void | Promise<void>, priority: 'high' | 'normal' | 'low' = 'normal') => {
  if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
    // Use native scheduler API if available
    const priorityMap = {
      high: 'user-blocking',
      normal: 'user-visible', 
      low: 'background'
    };
    
    return (window as any).scheduler.postTask(task, { 
      priority: priorityMap[priority] 
    });
  }
  
  if ('requestIdleCallback' in window && priority === 'low') {
    // Use requestIdleCallback for low priority tasks
    return window.requestIdleCallback(() => {
      const result = task();
      if (result instanceof Promise) {
        result.catch(console.error);
      }
    }, { timeout: 2000 });
  }
  
  // Fallback to setTimeout with appropriate delays
  const delayMap = {
    high: 0,
    normal: 16, // One frame
    low: 100
  };
  
  return setTimeout(() => {
    const result = task();
    if (result instanceof Promise) {
      result.catch(console.error);
    }
  }, delayMap[priority]);
};

export const yieldToMain = (): Promise<void> => {
  return new Promise(resolve => {
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      (window as any).scheduler.postTask(resolve, { priority: 'user-blocking' });
    } else {
      setTimeout(resolve, 0);
    }
  });
};

export const breakUpLongTask = async <T>(
  items: T[],
  processor: (item: T) => void | Promise<void>,
  batchSize: number = 5
): Promise<void> => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    for (const item of batch) {
      await processor(item);
    }
    
    // Yield to main thread after each batch
    if (i + batchSize < items.length) {
      await yieldToMain();
    }
  }
};