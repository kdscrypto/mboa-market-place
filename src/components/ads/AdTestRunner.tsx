// PHASE 4: Automated testing component for Adsterra ads
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdPerformanceMonitor } from '@/hooks/useAdPerformanceMonitor';
import { ADSTERRA_ZONE_CONFIG, AdsterraZoneValidator } from '@/config/adsterra';
import LazyAdContainer from './LazyAdContainer';
import { Play, Square, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface TestResult {
  zoneKey: string;
  status: 'running' | 'pass' | 'fail' | 'pending';
  loadTime?: number;
  error?: string;
  timestamp?: number;
}

const AdTestRunner: React.FC = () => {
  const [testResults, setTestResults] = useState<Map<string, TestResult>>(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { trackAdLoadStart, trackAdLoadEnd, createAlert } = useAdPerformanceMonitor();
  const abortController = useRef<AbortController | null>(null);

  const zones = Object.entries(ADSTERRA_ZONE_CONFIG);
  const totalZones = zones.length;

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    abortController.current = new AbortController();
    
    // Initialize all tests as pending
    const initialResults = new Map<string, TestResult>();
    zones.forEach(([zoneKey]) => {
      initialResults.set(zoneKey, { zoneKey, status: 'pending' });
    });
    setTestResults(initialResults);

    createAlert('info', `Starting tests for ${totalZones} zones...`);

    try {
      // Test zones sequentially to avoid overwhelming the system
      for (let i = 0; i < zones.length; i++) {
        if (abortController.current?.signal.aborted) {
          break;
        }

        const [zoneKey, zoneConfig] = zones[i];
        await runSingleTest(zoneKey, zoneConfig);
        setProgress(((i + 1) / totalZones) * 100);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const finalResults = Array.from(testResults.values());
      const passCount = finalResults.filter(r => r.status === 'pass').length;
      const failCount = finalResults.filter(r => r.status === 'fail').length;
      
      createAlert('info', `Tests completed: ${passCount} passed, ${failCount} failed`);
    } catch (error) {
      createAlert('error', `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
      abortController.current = null;
    }
  };

  const runSingleTest = async (zoneKey: string, zoneConfig: any): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let resolved = false;

      // Update status to running
      setTestResults(prev => new Map(prev.set(zoneKey, {
        zoneKey,
        status: 'running',
        timestamp: Date.now()
      })));

      trackAdLoadStart(zoneConfig.id);

      // Timeout for test
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          const loadTime = performance.now() - startTime;
          
          setTestResults(prev => new Map(prev.set(zoneKey, {
            zoneKey,
            status: 'fail',
            error: 'Test timeout (10s)',
            loadTime,
            timestamp: Date.now()
          })));

          trackAdLoadEnd(zoneConfig.id, false, 'Test timeout', 0);
          resolve();
        }
      }, 10000);

      // Create a temporary test container
      const testContainer = document.createElement('div');
      testContainer.id = `test-${zoneKey}-${Date.now()}`;
      testContainer.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
      document.body.appendChild(testContainer);

      try {
        // Simulate ad loading by checking if zone configuration is valid
        const isValid = AdsterraZoneValidator.validateZoneId(zoneConfig.id);
        const hasScriptUrl = !!zoneConfig.scriptUrl;
        
        // Simulate network request delay
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            
            const loadTime = performance.now() - startTime;
            const success = isValid && hasScriptUrl;
            
            setTestResults(prev => new Map(prev.set(zoneKey, {
              zoneKey,
              status: success ? 'pass' : 'fail',
              loadTime,
              error: success ? undefined : 'Invalid configuration or missing script URL',
              timestamp: Date.now()
            })));

            trackAdLoadEnd(zoneConfig.id, success, success ? undefined : 'Configuration error', 0);
            document.body.removeChild(testContainer);
            resolve();
          }
        }, Math.random() * 2000 + 1000); // 1-3 second delay

      } catch (error) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          
          const loadTime = performance.now() - startTime;
          
          setTestResults(prev => new Map(prev.set(zoneKey, {
            zoneKey,
            status: 'fail',
            error: error instanceof Error ? error.message : 'Unknown error',
            loadTime,
            timestamp: Date.now()
          })));

          trackAdLoadEnd(zoneConfig.id, false, error instanceof Error ? error.message : 'Unknown error', 0);
          document.body.removeChild(testContainer);
          resolve();
        }
      }
    });
  };

  const stopTests = () => {
    if (abortController.current) {
      abortController.current.abort();
      createAlert('info', 'Tests stopped by user');
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-600'
    };
    
    return variants[status] || variants.pending;
  };

  const results = Array.from(testResults.values());
  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const runningCount = results.filter(r => r.status === 'running').length;

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Test Automatisé des Publicités</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Lancer tous les tests
              </Button>
              {isRunning && (
                <Button 
                  onClick={stopTests} 
                  variant="destructive"
                  size="sm"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Arrêter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress */}
            {isRunning && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progression des tests</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{totalZones}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{passCount}</div>
                <div className="text-xs text-muted-foreground">Réussis</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{failCount}</div>
                <div className="text-xs text-muted-foreground">Échoués</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{runningCount}</div>
                <div className="text-xs text-muted-foreground">En cours</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Résultats des Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {zones.map(([zoneKey, zoneConfig]) => {
              const result = testResults.get(zoneKey);
              
              return (
                <div key={zoneKey} className="flex items-center gap-3 p-3 rounded-lg border">
                  {getStatusIcon(result?.status || 'pending')}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{zoneKey}</span>
                      <Badge variant="secondary" className={getStatusBadge(result?.status || 'pending')}>
                        {result?.status || 'pending'}
                      </Badge>
                      {zoneConfig.isProduction && (
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          PROD
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>Zone: {zoneConfig.id}</span>
                      <span>Type: {zoneConfig.type}</span>
                      {result?.loadTime && (
                        <span>Temps: {Math.round(result.loadTime)}ms</span>
                      )}
                    </div>
                    {result?.error && (
                      <p className="text-xs text-red-600 mt-1">{result.error}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdTestRunner;