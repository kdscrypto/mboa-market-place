import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const AdsterraDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnosticResults: DiagnosticResult[] = [];

    // Test 1: Check window.atAsyncOptions
    try {
      if (typeof window !== 'undefined') {
        if (window.atAsyncOptions) {
          diagnosticResults.push({
            test: 'atAsyncOptions Initialization',
            status: 'pass',
            message: 'Adsterra async options initialized',
            details: `Length: ${window.atAsyncOptions.length}`
          });
        } else {
          diagnosticResults.push({
            test: 'atAsyncOptions Initialization',
            status: 'fail',
            message: 'atAsyncOptions not found',
            details: 'The Adsterra configuration object is missing'
          });
        }
      }
    } catch (error) {
      diagnosticResults.push({
        test: 'atAsyncOptions Initialization',
        status: 'fail',
        message: 'Error checking atAsyncOptions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Check for loaded scripts
    const adsterraScripts = Array.from(document.scripts).filter(script => 
      script.src.includes('adsterra') || 
      script.src.includes('profitabledisplaycontent') ||
      script.src.includes('revenuecpmgate')
    );

    if (adsterraScripts.length > 0) {
      diagnosticResults.push({
        test: 'Script Loading',
        status: 'pass',
        message: `${adsterraScripts.length} Adsterra script(s) loaded`,
        details: adsterraScripts.map(s => s.src).join(', ')
      });
    } else {
      diagnosticResults.push({
        test: 'Script Loading',
        status: 'fail',
        message: 'No Adsterra scripts found',
        details: 'Scripts may not be loading properly'
      });
    }

    // Test 3: Check network connectivity to Adsterra
    try {
      const response = await fetch('https://www.profitabledisplaycontent.com/assets/js/async.min.js', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      diagnosticResults.push({
        test: 'Network Connectivity',
        status: 'pass',
        message: 'Can reach Adsterra servers',
        details: 'Network connection appears healthy'
      });
    } catch (error) {
      diagnosticResults.push({
        test: 'Network Connectivity',
        status: 'warning',
        message: 'Network test inconclusive',
        details: 'CORS policy prevents direct testing, but this is normal'
      });
    }

    // Test 4: Check for ad containers
    const adContainers = document.querySelectorAll('[data-zone], [id^="container-"], .adsterra-zone');
    
    if (adContainers.length > 0) {
      diagnosticResults.push({
        test: 'Ad Containers',
        status: 'pass',
        message: `${adContainers.length} ad container(s) found`,
        details: Array.from(adContainers).map(el => el.id || el.className).join(', ')
      });
    } else {
      diagnosticResults.push({
        test: 'Ad Containers',
        status: 'fail',
        message: 'No ad containers found',
        details: 'Ad containers may not be properly initialized'
      });
    }

    // Test 5: Check for ad blocker detection
    try {
      const testDiv = document.createElement('div');
      testDiv.innerHTML = '&nbsp;';
      testDiv.className = 'adsbox';
      document.body.appendChild(testDiv);
      
      setTimeout(() => {
        if (testDiv.offsetHeight === 0) {
          diagnosticResults.push({
            test: 'Ad Blocker Detection',
            status: 'fail',
            message: 'Ad blocker detected',
            details: 'An ad blocker may be preventing ads from displaying'
          });
        } else {
          diagnosticResults.push({
            test: 'Ad Blocker Detection',
            status: 'pass',
            message: 'No ad blocker detected',
            details: 'Ads should be able to display'
          });
        }
        document.body.removeChild(testDiv);
        setResults([...diagnosticResults]);
        setIsRunning(false);
      }, 100);
    } catch (error) {
      diagnosticResults.push({
        test: 'Ad Blocker Detection',
        status: 'warning',
        message: 'Could not test for ad blocker',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      setResults(diagnosticResults);
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Adsterra Integration Diagnostics
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isRunning ? 'Running...' : 'Run Tests'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.length === 0 && !isRunning && (
            <p className="text-gray-500">Click "Run Tests" to diagnose Adsterra integration issues.</p>
          )}
          
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <h3 className="font-semibold">{result.test}</h3>
                </div>
                <Badge className={getStatusColor(result.status)}>
                  {result.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">{result.message}</p>
              {result.details && (
                <p className="text-xs text-gray-400 font-mono bg-gray-50 p-2 rounded">
                  {result.details}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdsterraDiagnostic;