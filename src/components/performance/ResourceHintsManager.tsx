
import React, { useEffect } from 'react';

interface ResourceHint {
  href: string;
  rel: 'preconnect' | 'dns-prefetch' | 'prefetch' | 'preload' | 'modulepreload';
  as?: 'style' | 'script' | 'font' | 'image' | 'document' | 'fetch';
  type?: string;
  crossorigin?: boolean | 'anonymous' | 'use-credentials';
  importance?: 'high' | 'medium' | 'low';
  media?: string;
  sizes?: string;
}

interface ResourceHintsManagerProps {
  hints: ResourceHint[];
  enablePrefetching?: boolean;
  enablePreloading?: boolean;
}

const ResourceHintsManager: React.FC<ResourceHintsManagerProps> = ({ 
  hints, 
  enablePrefetching = true,
  enablePreloading = true 
}) => {
  useEffect(() => {
    const addedElements: HTMLLinkElement[] = [];
    const observedIntersections = new Set<string>();

    // Sort hints by importance
    const sortedHints = hints.sort((a, b) => {
      const importanceOrder = { high: 3, medium: 2, low: 1 };
      const aImportance = importanceOrder[a.importance || 'medium'];
      const bImportance = importanceOrder[b.importance || 'medium'];
      return bImportance - aImportance;
    });

    // Process high priority hints immediately
    const highPriorityHints = sortedHints.filter(hint => hint.importance === 'high');
    highPriorityHints.forEach(hint => {
      if ((hint.rel === 'preload' && enablePreloading) || 
          (hint.rel === 'prefetch' && enablePrefetching) ||
          hint.rel === 'preconnect' || hint.rel === 'dns-prefetch') {
        addResourceHint(hint, addedElements);
      }
    });

    // Process medium priority hints with slight delay
    setTimeout(() => {
      const mediumPriorityHints = sortedHints.filter(hint => hint.importance === 'medium');
      mediumPriorityHints.forEach(hint => {
        if (shouldAddHint(hint, enablePrefetching, enablePreloading)) {
          addResourceHint(hint, addedElements);
        }
      });
    }, 100);

    // Process low priority hints when idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const lowPriorityHints = sortedHints.filter(hint => hint.importance === 'low');
        lowPriorityHints.forEach(hint => {
          if (shouldAddHint(hint, enablePrefetching, enablePreloading)) {
            addResourceHint(hint, addedElements);
          }
        });
      });
    } else {
      setTimeout(() => {
        const lowPriorityHints = sortedHints.filter(hint => hint.importance === 'low');
        lowPriorityHints.forEach(hint => {
          if (shouldAddHint(hint, enablePrefetching, enablePreloading)) {
            addResourceHint(hint, addedElements);
          }
        });
      }, 500);
    }

    // Set up intersection observer for lazy prefetching
    if ('IntersectionObserver' in window) {
      const prefetchOnView = sortedHints.filter(hint => 
        hint.rel === 'prefetch' && hint.importance === 'low'
      );

      if (prefetchOnView.length > 0) {
        setupIntersectionObserver(prefetchOnView, addedElements, observedIntersections);
      }
    }

    // Cleanup function
    return () => {
      addedElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    };
  }, [hints, enablePrefetching, enablePreloading]);

  const shouldAddHint = (hint: ResourceHint, prefetchEnabled: boolean, preloadEnabled: boolean): boolean => {
    if (hint.rel === 'prefetch' && !prefetchEnabled) return false;
    if (hint.rel === 'preload' && !preloadEnabled) return false;
    return true;
  };

  const addResourceHint = (hint: ResourceHint, addedElements: HTMLLinkElement[]) => {
    // Check if hint already exists
    const selector = `link[href="${hint.href}"][rel="${hint.rel}"]`;
    const existing = document.querySelector(selector);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    
    // Set optional attributes
    if (hint.as) link.as = hint.as;
    if (hint.type) link.type = hint.type;
    if (hint.media) link.media = hint.media;
    if (hint.sizes) link.setAttribute('sizes', hint.sizes);
    
    // Handle crossorigin attribute
    if (hint.crossorigin === true || hint.crossorigin === 'anonymous') {
      link.crossOrigin = 'anonymous';
    } else if (hint.crossorigin === 'use-credentials') {
      link.crossOrigin = 'use-credentials';
    }

    // Add importance hint for supported browsers
    if (hint.importance && 'importance' in link) {
      (link as any).importance = hint.importance;
    }

    // Add event listeners for monitoring
    link.onload = () => {
      console.log(`Resource hint loaded successfully: ${hint.rel} ${hint.href}`);
    };

    link.onerror = () => {
      console.warn(`Resource hint failed to load: ${hint.rel} ${hint.href}`);
    };

    // Add to document head
    document.head.appendChild(link);
    addedElements.push(link);

    console.log(`Added resource hint: ${hint.rel} ${hint.href} (importance: ${hint.importance || 'medium'})`);
  };

  const setupIntersectionObserver = (
    hints: ResourceHint[], 
    addedElements: HTMLLinkElement[],
    observedIntersections: Set<string>
  ) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const hintData = target.dataset.prefetchHint;
          
          if (hintData && !observedIntersections.has(hintData)) {
            observedIntersections.add(hintData);
            const hint = JSON.parse(hintData) as ResourceHint;
            addResourceHint(hint, addedElements);
            observer.unobserve(target);
          }
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.1
    });

    // Observe elements that should trigger prefetching
    const observableElements = document.querySelectorAll('[data-prefetch-trigger]');
    observableElements.forEach(element => {
      observer.observe(element);
    });

    return observer;
  };

  return null;
};

// Hook for dynamic resource hints management
export const useResourceHints = () => {
  const [hints, setHints] = React.useState<ResourceHint[]>([]);

  const addHint = React.useCallback((hint: ResourceHint) => {
    setHints(prev => {
      const exists = prev.some(h => h.href === hint.href && h.rel === hint.rel);
      if (exists) return prev;
      return [...prev, hint];
    });
  }, []);

  const removeHint = React.useCallback((href: string, rel: string) => {
    setHints(prev => prev.filter(h => !(h.href === href && h.rel === rel)));
  }, []);

  const clearHints = React.useCallback(() => {
    setHints([]);
  }, []);

  return { hints, addHint, removeHint, clearHints };
};

export default ResourceHintsManager;
