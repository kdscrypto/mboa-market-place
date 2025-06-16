
import React from 'react';

interface BundleInfo {
  name: string;
  size: number;
  loadTime: number;
}

const BundleAnalyzer: React.FC = () => {
  const [bundles, setBundles] = React.useState<BundleInfo[]>([]);

  React.useEffect(() => {
    // Analyze loaded scripts
    const analyzeBundle = () => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const bundleData: BundleInfo[] = [];

      scripts.forEach((script, index) => {
        const src = script.getAttribute('src');
        if (src && src.includes('assets')) {
          const performanceEntries = performance.getEntriesByName(src);
          const entry = performanceEntries[0] as PerformanceResourceTiming;
          
          if (entry) {
            bundleData.push({
              name: src.split('/').pop() || `bundle-${index}`,
              size: entry.transferSize || 0,
              loadTime: entry.responseEnd - entry.responseStart
            });
          }
        }
      });

      setBundles(bundleData);
    };

    // Wait for resources to load
    if (document.readyState === 'complete') {
      analyzeBundle();
    } else {
      window.addEventListener('load', analyzeBundle);
    }

    return () => {
      window.removeEventListener('load', analyzeBundle);
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Bundle Analysis</h3>
      {bundles.map((bundle, index) => (
        <div key={index} className="mb-1">
          <div className="flex justify-between">
            <span className="truncate">{bundle.name}</span>
            <span>{(bundle.size / 1024).toFixed(1)}KB</span>
          </div>
          <div className="text-gray-400">
            Load: {bundle.loadTime.toFixed(0)}ms
          </div>
        </div>
      ))}
    </div>
  );
};

export default BundleAnalyzer;
