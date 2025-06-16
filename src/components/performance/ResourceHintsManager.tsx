
import React, { useEffect } from 'react';

interface ResourceHint {
  href: string;
  rel: 'preconnect' | 'dns-prefetch' | 'prefetch' | 'preload';
  as?: string;
  type?: string;
  crossorigin?: boolean;
}

interface ResourceHintsManagerProps {
  hints: ResourceHint[];
}

const ResourceHintsManager: React.FC<ResourceHintsManagerProps> = ({ hints }) => {
  useEffect(() => {
    const addedElements: HTMLLinkElement[] = [];

    hints.forEach((hint) => {
      // Check if hint already exists
      const existing = document.querySelector(`link[href="${hint.href}"][rel="${hint.rel}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      
      if (hint.as) link.as = hint.as;
      if (hint.type) link.type = hint.type;
      if (hint.crossorigin) link.crossOrigin = 'anonymous';

      // Add to document head
      document.head.appendChild(link);
      addedElements.push(link);

      console.log(`Added resource hint: ${hint.rel} ${hint.href}`);
    });

    // Cleanup function
    return () => {
      addedElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    };
  }, [hints]);

  return null;
};

export default ResourceHintsManager;
