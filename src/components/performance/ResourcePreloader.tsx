
import React from 'react';

interface PreloadResource {
  href: string;
  as: 'style' | 'script' | 'font' | 'image';
  type?: string;
  crossorigin?: string;
}

interface ResourcePreloaderProps {
  resources: PreloadResource[];
}

const ResourcePreloader: React.FC<ResourcePreloaderProps> = ({ resources }) => {
  React.useEffect(() => {
    resources.forEach((resource) => {
      // Check if resource is already preloaded
      const existingLink = document.querySelector(`link[href="${resource.href}"]`);
      if (existingLink) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      
      if (resource.type) {
        link.type = resource.type;
      }
      
      if (resource.crossorigin) {
        link.crossOrigin = resource.crossorigin;
      }

      document.head.appendChild(link);
    });
  }, [resources]);

  return null;
};

export default ResourcePreloader;
