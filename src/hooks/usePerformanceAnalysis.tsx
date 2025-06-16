
import { useWebWorker } from './useWebWorker';
import performanceAnalysisWorker from '../workers/performanceAnalysis';

interface PerformanceAnalysisResult {
  ttfb: number;
  domContentLoaded: number;
  loadComplete: number;
  resourceBreakdown: {
    scripts: { count: number; size: number };
    stylesheets: { count: number; size: number };
    images: { count: number; size: number };
    fonts: { count: number; size: number };
    other: { count: number; size: number };
  };
  performanceScore: number;
}

export const usePerformanceAnalysis = () => {
  const worker = useWebWorker<any, PerformanceAnalysisResult>(performanceAnalysisWorker);

  const analyzePerformance = () => {
    const timings = performance.timing;
    const resources = performance.getEntriesByType('resource');

    worker.postMessage({
      type: 'CALCULATE_METRICS',
      data: { timings, resources }
    });
  };

  const analyzeImages = (images: any[]) => {
    worker.postMessage({
      type: 'ANALYZE_IMAGES',
      data: images
    });
  };

  const optimizeBundle = (bundles: any[]) => {
    worker.postMessage({
      type: 'OPTIMIZE_BUNDLE',
      data: bundles
    });
  };

  return {
    analyzePerformance,
    analyzeImages,
    optimizeBundle,
    result: worker.result,
    isLoading: worker.isLoading,
    error: worker.error
  };
};
