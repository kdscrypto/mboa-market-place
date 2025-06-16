
const performanceAnalysisWorker = `
// Performance Analysis Web Worker
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  try {
    switch (type) {
      case 'ANALYZE_IMAGES':
        analyzeImagePerformance(data);
        break;
      case 'CALCULATE_METRICS':
        calculatePerformanceMetrics(data);
        break;
      case 'OPTIMIZE_BUNDLE':
        optimizeBundleAnalysis(data);
        break;
      default:
        self.postMessage({ error: 'Unknown task type' });
    }
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};

function analyzeImagePerformance(images) {
  const analysis = images.map(img => {
    const optimalWidth = Math.min(img.naturalWidth, 800);
    const compressionRatio = img.fileSize / (optimalWidth * (img.naturalHeight * optimalWidth / img.naturalWidth) * 3);
    
    return {
      src: img.src,
      currentSize: img.fileSize,
      optimalSize: Math.round(optimalWidth * (img.naturalHeight * optimalWidth / img.naturalWidth) * 0.8),
      savings: Math.max(0, img.fileSize - Math.round(optimalWidth * (img.naturalHeight * optimalWidth / img.naturalWidth) * 0.8)),
      compressionRatio,
      recommendation: compressionRatio > 10 ? 'compress' : 'optimize'
    };
  });
  
  self.postMessage({ result: analysis });
}

function calculatePerformanceMetrics(data) {
  const { timings, resources } = data;
  
  // Calculate various performance metrics
  const metrics = {
    // Time to First Byte
    ttfb: timings.responseStart - timings.requestStart,
    
    // DOM Content Loaded
    domContentLoaded: timings.domContentLoadedEventEnd - timings.navigationStart,
    
    // Load Complete
    loadComplete: timings.loadEventEnd - timings.navigationStart,
    
    // Resource breakdown
    resourceBreakdown: analyzeResources(resources),
    
    // Performance score (0-100)
    performanceScore: calculatePerformanceScore(timings, resources)
  };
  
  self.postMessage({ result: metrics });
}

function analyzeResources(resources) {
  const breakdown = {
    scripts: { count: 0, size: 0 },
    stylesheets: { count: 0, size: 0 },
    images: { count: 0, size: 0 },
    fonts: { count: 0, size: 0 },
    other: { count: 0, size: 0 }
  };
  
  resources.forEach(resource => {
    const type = getResourceType(resource.name);
    breakdown[type].count++;
    breakdown[type].size += resource.transferSize || 0;
  });
  
  return breakdown;
}

function getResourceType(url) {
  if (url.match(/\\.(js|mjs)$/)) return 'scripts';
  if (url.match(/\\.(css)$/)) return 'stylesheets';
  if (url.match(/\\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'images';
  if (url.match(/\\.(woff|woff2|ttf|otf)$/)) return 'fonts';
  return 'other';
}

function calculatePerformanceScore(timings, resources) {
  let score = 100;
  
  // Penalize slow TTFB
  const ttfb = timings.responseStart - timings.requestStart;
  if (ttfb > 600) score -= 20;
  else if (ttfb > 300) score -= 10;
  
  // Penalize slow FCP
  const fcp = timings.domContentLoadedEventEnd - timings.navigationStart;
  if (fcp > 3000) score -= 25;
  else if (fcp > 1500) score -= 15;
  
  // Penalize large bundle sizes
  const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  if (totalSize > 1000000) score -= 20; // 1MB
  else if (totalSize > 500000) score -= 10; // 500KB
  
  // Penalize too many requests
  if (resources.length > 50) score -= 15;
  else if (resources.length > 30) score -= 10;
  
  return Math.max(0, score);
}

function optimizeBundleAnalysis(bundles) {
  const optimization = bundles.map(bundle => {
    const suggestions = [];
    
    if (bundle.size > 100000) { // 100KB
      suggestions.push('Consider code splitting');
    }
    
    if (bundle.name.includes('node_modules')) {
      suggestions.push('Move to separate vendor chunk');
    }
    
    if (bundle.loadTime > 1000) {
      suggestions.push('Optimize loading strategy');
    }
    
    return {
      ...bundle,
      suggestions,
      priority: suggestions.length > 0 ? 'high' : 'low'
    };
  });
  
  self.postMessage({ result: optimization });
}
`;

export default performanceAnalysisWorker;
