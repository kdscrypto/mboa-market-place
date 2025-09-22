// Migration helper to identify and upgrade legacy ad implementations
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, ArrowRight, Zap } from 'lucide-react';
import { ADSTERRA_ZONE_CONFIG, AdsterraZoneValidator } from '@/config/adsterra';

interface MigrationIssue {
  type: 'deprecated_hook' | 'invalid_zone' | 'test_zone' | 'performance_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  zoneId: string;
  message: string;
  recommendation: string;
  autoFixAvailable: boolean;
}

const AdMigrationHelper: React.FC = () => {
  const [issues, setIssues] = useState<MigrationIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const scanForMigrationIssues = async () => {
    setIsScanning(true);
    setIssues([]);
    
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const foundIssues: MigrationIssue[] = [];

    // Check for deprecated hook usage (would need runtime detection in real implementation)
    const deprecatedHooks = [
      'useAdsterraBanner',
      'useAdsterraNative', 
      'useAdsterraSocialBar'
    ];

    // Check console for migration warnings
    const consoleWarnings = performance.getEntriesByType('measure').filter(
      entry => entry.name.includes('MIGRATION') || entry.name.includes('DEPRECATED')
    );

    if (consoleWarnings.length > 0) {
      foundIssues.push({
        type: 'deprecated_hook',
        severity: 'medium',
        component: 'Multiple components',
        zoneId: 'various',
        message: 'Deprecated hooks detected in console warnings',
        recommendation: 'Upgrade to LazyAdContainer components for better performance',
        autoFixAvailable: false
      });
    }

    // Check zone configuration
    Object.entries(ADSTERRA_ZONE_CONFIG).forEach(([key, config]) => {
      if (!config.isProduction) {
        foundIssues.push({
          type: 'test_zone',
          severity: 'high',
          component: key,
          zoneId: config.id,
          message: `Test zone configuration detected: ${config.id}`,
          recommendation: 'Replace with production Adsterra zone ID',
          autoFixAvailable: false
        });
      }

      if (!AdsterraZoneValidator.validateZoneId(config.id)) {
        foundIssues.push({
          type: 'invalid_zone',
          severity: 'critical',
          component: key,
          zoneId: config.id,
          message: `Invalid zone ID format: ${config.id}`,
          recommendation: 'Use proper Adsterra zone ID format (32 character hex)',
          autoFixAvailable: false
        });
      }
    });

    // Check for performance issues
    const adElements = document.querySelectorAll('[data-zone]');
    adElements.forEach((element, index) => {
      const zoneId = element.getAttribute('data-zone');
      const hasLazyLoading = element.closest('[data-testid*="ad-container"]');
      
      if (!hasLazyLoading) {
        foundIssues.push({
          type: 'performance_issue',
          severity: 'medium',
          component: `Ad Element ${index + 1}`,
          zoneId: zoneId || 'unknown',
          message: 'Ad element not using lazy loading system',
          recommendation: 'Migrate to LazyAdContainer for better performance',
          autoFixAvailable: true
        });
      }
    });

    setIssues(foundIssues);
    setIsScanning(false);
    setScanComplete(true);
  };

  const getSeverityIcon = (severity: MigrationIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: MigrationIssue['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
    }
  };

  const getProductionZoneCount = () => {
    return AdsterraZoneValidator.getProductionZones().length;
  };

  const getTotalZoneCount = () => {
    return Object.keys(ADSTERRA_ZONE_CONFIG).length;
  };

  useEffect(() => {
    // Auto-scan on mount
    scanForMigrationIssues();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <span>Migration Assistant Adsterra</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getProductionZoneCount()}
              </div>
              <div className="text-sm text-muted-foreground">
                Zones de production
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getTotalZoneCount()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total des zones
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {issues.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Problèmes détectés
              </div>
            </div>
          </div>

          <Button
            onClick={scanForMigrationIssues}
            disabled={isScanning}
            className="w-full"
          >
            {isScanning ? 'Analyse en cours...' : 'Relancer l\'analyse'}
          </Button>
        </CardContent>
      </Card>

      {scanComplete && (
        <Card>
          <CardHeader>
            <CardTitle>Problèmes de migration détectés</CardTitle>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun problème détecté!</h3>
                <p className="text-muted-foreground">
                  Votre configuration Adsterra semble optimale.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {issues.map((issue, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 border rounded-lg"
                  >
                    {getSeverityIcon(issue.severity)}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{issue.component}</h4>
                        <Badge variant={getSeverityColor(issue.severity)}>
                          {issue.severity.toUpperCase()}
                        </Badge>
                        {issue.autoFixAvailable && (
                          <Badge variant="outline" className="text-green-600">
                            Auto-fix disponible
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {issue.message}
                      </p>
                      
                      <div className="flex items-center space-x-2 text-xs text-blue-600">
                        <ArrowRight className="h-3 w-3" />
                        <span>{issue.recommendation}</span>
                      </div>
                      
                      {issue.zoneId !== 'various' && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Zone ID: <code className="bg-muted px-1 rounded">{issue.zoneId}</code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdMigrationHelper;