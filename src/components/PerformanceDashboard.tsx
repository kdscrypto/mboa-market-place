import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { usePerformanceMonitor } from '@/utils/performanceMonitor';
import { useAdvancedCache } from '@/hooks/useAdvancedCaching';
import { useResourceOptimizer } from '@/utils/resourceOptimizer';
import { useRealTimeMonitoring } from '@/utils/realTimeMonitoring';
import { usePerformanceTesting } from '@/utils/performanceTesting';
import { useMobileOptimizations } from '@/hooks/useMobileOptimizations';
import { Activity, Zap, Database, Globe, TrendingUp, AlertTriangle, Smartphone, TestTube, Radio } from 'lucide-react';

const PerformanceDashboard: React.FC = () => {
  const { getMetrics, getWebVitals, reportMetrics } = usePerformanceMonitor();
  const cache = useAdvancedCache();
  const resourceOptimizer = useResourceOptimizer();
  const realTimeMonitor = useRealTimeMonitoring();
  const performanceTester = usePerformanceTesting();
  const { getDeviceInfo, forceOptimizationMode } = useMobileOptimizations();
  
  const [metrics, setMetrics] = useState(getMetrics());
  const [webVitals, setWebVitals] = useState(getWebVitals());
  const [cacheStats, setCacheStats] = useState(cache.getStats());
  const [monitoringStats, setMonitoringStats] = useState(realTimeMonitor.getStats());
  const [testResults, setTestResults] = useState(performanceTester.getTestResults());
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    // Start real-time monitoring
    realTimeMonitor.startMonitoring();
    
    const interval = setInterval(() => {
      setMetrics(getMetrics());
      setWebVitals(getWebVitals());
      setCacheStats(cache.getStats());
      setMonitoringStats(realTimeMonitor.getStats());
      setDeviceInfo(getDeviceInfo());
    }, 5000);

    return () => {
      clearInterval(interval);
      realTimeMonitor.stopMonitoring();
    };
  }, [getMetrics, getWebVitals, cache, realTimeMonitor, getDeviceInfo]);

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

  const runPerformanceTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await performanceTester.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Failed to run performance tests:', error);
    } finally {
      setIsRunningTests(false);
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
          <Button onClick={runPerformanceTests} variant="outline" disabled={isRunningTests}>
            <TestTube className="h-4 w-4 mr-2" />
            {isRunningTests ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
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

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                Real-time Monitoring
              </CardTitle>
              <CardDescription>Live performance monitoring and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{monitoringStats?.totalAlerts || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Alerts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{monitoringStats?.criticalAlerts || 0}</div>
                  <div className="text-sm text-muted-foreground">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{monitoringStats?.warningAlerts || 0}</div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {((monitoringStats?.errorRate || 0) * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Error Rate</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={realTimeMonitor.startMonitoring} 
                  variant="outline" 
                  size="sm"
                  disabled={monitoringStats?.isMonitoring}
                >
                  Start Monitoring
                </Button>
                <Button 
                  onClick={realTimeMonitor.stopMonitoring} 
                  variant="outline" 
                  size="sm"
                  disabled={!monitoringStats?.isMonitoring}
                >
                  Stop Monitoring
                </Button>
                <Button onClick={realTimeMonitor.clearAlerts} variant="outline" size="sm">
                  Clear Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Automated Performance Testing
              </CardTitle>
              <CardDescription>Run comprehensive performance test suites</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button 
                  onClick={runPerformanceTests} 
                  disabled={isRunningTests}
                  className="w-full"
                >
                  {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
                </Button>
                <Button 
                  onClick={performanceTester.clearResults} 
                  variant="outline"
                >
                  Clear Results
                </Button>
              </div>
              
              {Object.keys(testResults).length > 0 && (
                <div className="space-y-4">
                  {Object.entries(testResults).map(([suiteName, results]) => (
                    <div key={suiteName} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{suiteName}</h4>
                      <div className="space-y-2">
                        {results.map((result, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className={result.passed ? 'text-green-600' : 'text-red-600'}>
                              {result.passed ? '✅' : '❌'} {result.message}
                            </span>
                            <span className="text-muted-foreground">
                              {result.duration.toFixed(2)}ms
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Optimizations
              </CardTitle>
              <CardDescription>Device-specific performance optimizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Device Info</h4>
                  <div className="space-y-1 text-sm">
                    <div>Low-end device: {deviceInfo.isLowEndDevice ? 'Yes' : 'No'}</div>
                    <div>Connection: {deviceInfo.connectionType}</div>
                    <div>Battery: {(deviceInfo.batteryLevel * 100).toFixed(0)}%</div>
                    <div>Charging: {deviceInfo.isCharging ? 'Yes' : 'No'}</div>
                    <div>Reduced motion: {deviceInfo.reducedMotion ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Optimization Mode</h4>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => forceOptimizationMode('low-end')} 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      Force Low-end Mode
                    </Button>
                    <Button 
                      onClick={() => forceOptimizationMode('high-end')} 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      Force High-end Mode
                    </Button>
                    <Button 
                      onClick={() => forceOptimizationMode('auto')} 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      Auto Mode
                    </Button>
                  </div>
                </div>
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