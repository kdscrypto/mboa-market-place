import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { usePerformanceMonitor } from '@/utils/performanceMonitor';
import { useAdvancedCache } from '@/hooks/useAdvancedCaching';
import { useResourceOptimizer } from '@/utils/resourceOptimizer';
import { Activity, Zap, Database, Globe, TrendingUp, AlertTriangle } from 'lucide-react';

const PerformanceDashboard: React.FC = () => {
  const { getMetrics, getWebVitals, reportMetrics } = usePerformanceMonitor();
  const cache = useAdvancedCache();
  const resourceOptimizer = useResourceOptimizer();
  const [metrics, setMetrics] = useState(getMetrics());
  const [webVitals, setWebVitals] = useState(getWebVitals());
  const [cacheStats, setCacheStats] = useState(cache.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetrics());
      setWebVitals(getWebVitals());
      setCacheStats(cache.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, [getMetrics, getWebVitals, cache]);

  const getVitalScore = (metric: number | undefined, thresholds: [number, number]) => {
    if (!metric) return 'unknown';
    if (metric <= thresholds[0]) return 'good';
    if (metric <= thresholds[1]) return 'needs-improvement';
    return 'poor';
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">Monitor and optimize your application performance</p>
        </div>
        <div className="space-x-2">
          <Button onClick={reportMetrics} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button onClick={resourceOptimizer.analyzeBundle} variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analyze Bundle
          </Button>
        </div>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">First Contentful Paint</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {webVitals.FCP ? `${webVitals.FCP.toFixed(0)}ms` : 'N/A'}
                </div>
                <Badge 
                  className={`mt-2 ${getScoreColor(getVitalScore(webVitals.FCP, [1800, 3000]))}`}
                >
                  {getVitalScore(webVitals.FCP, [1800, 3000])}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Largest Contentful Paint</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {webVitals.LCP ? `${webVitals.LCP.toFixed(0)}ms` : 'N/A'}
                </div>
                <Badge 
                  className={`mt-2 ${getScoreColor(getVitalScore(webVitals.LCP, [2500, 4000]))}`}
                >
                  {getVitalScore(webVitals.LCP, [2500, 4000])}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">First Input Delay</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {webVitals.FID ? `${webVitals.FID.toFixed(0)}ms` : 'N/A'}
                </div>
                <Badge 
                  className={`mt-2 ${getScoreColor(getVitalScore(webVitals.FID, [100, 300]))}`}
                >
                  {getVitalScore(webVitals.FID, [100, 300])}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cumulative Layout Shift</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {webVitals.CLS ? webVitals.CLS.toFixed(3) : 'N/A'}
                </div>
                <Badge 
                  className={`mt-2 ${getScoreColor(getVitalScore(webVitals.CLS, [0.1, 0.25]))}`}
                >
                  {getVitalScore(webVitals.CLS, [0.1, 0.25])}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Load Performance</CardTitle>
                <CardDescription>Application loading metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Load Time</span>
                  <span className="font-mono">{metrics?.loadTime?.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Render Time</span>
                  <span className="font-mono">{metrics?.renderTime?.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>TTFB</span>
                  <span className="font-mono">{webVitals.TTFB?.toFixed(0)}ms</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>JavaScript heap and memory statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics?.memoryUsage ? (
                  <>
                    <div className="flex justify-between">
                      <span>Used JS Heap</span>
                      <span className="font-mono">
                        {formatBytes(metrics.memoryUsage.usedJSHeapSize)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total JS Heap</span>
                      <span className="font-mono">
                        {formatBytes(metrics.memoryUsage.totalJSHeapSize)}
                      </span>
                    </div>
                    <Progress 
                      value={(metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.totalJSHeapSize) * 100}
                      className="w-full"
                    />
                  </>
                ) : (
                  <p className="text-muted-foreground">Memory info not available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Cache Statistics
              </CardTitle>
              <CardDescription>Advanced caching performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cacheStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{cacheStats.size}</div>
                    <div className="text-sm text-muted-foreground">Cached Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{cacheStats.totalAccessCount}</div>
                    <div className="text-sm text-muted-foreground">Total Accesses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {(cacheStats.averageAge / 1000 / 60).toFixed(1)}m
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Age</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatBytes(cacheStats.memoryUsage)}
                    </div>
                    <div className="text-sm text-muted-foreground">Memory</div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No cache statistics available</p>
              )}
              <div className="flex gap-2">
                <Button onClick={cache.clear} variant="outline" size="sm">
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Optimization</CardTitle>
                <CardDescription>Optimize fonts, images, and assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={resourceOptimizer.optimizeFonts} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  Optimize Fonts
                </Button>
                <Button 
                  onClick={resourceOptimizer.registerServiceWorker} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  Register Service Worker
                </Button>
                <Button 
                  onClick={resourceOptimizer.cleanupUnusedResources} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  Cleanup Unused Resources
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Tips</CardTitle>
                <CardDescription>Recommendations for better performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm space-y-1">
                  <p>• Enable compression (gzip/brotli)</p>
                  <p>• Use WebP images where supported</p>
                  <p>• Minimize unused JavaScript</p>
                  <p>• Optimize critical rendering path</p>
                  <p>• Use efficient cache strategies</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;