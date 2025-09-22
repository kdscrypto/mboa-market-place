// PHASE 5: Comprehensive monitoring dashboard for Adsterra ads
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdPerformanceMonitor } from '@/hooks/useAdPerformanceMonitor';
import { getAnalyticsSummary, getAnalyticsData } from '@/hooks/useAdAnalytics';
import AdsterraDiagnostic from './AdsterraDiagnostic';
import AdTestRunner from './AdTestRunner';
import { Activity, BarChart3, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';

const AdMonitoringDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(getAnalyticsData());
  const [analyticsSummary, setAnalyticsSummary] = useState(getAnalyticsSummary());
  const { 
    getPerformanceSummary, 
    alerts, 
    clearAlerts,
    runPerformanceTests 
  } = useAdPerformanceMonitor();

  const perfSummary = getPerformanceSummary();

  // Refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData(getAnalyticsData());
      setAnalyticsSummary(getAnalyticsSummary());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setAnalyticsData(getAnalyticsData());
    setAnalyticsSummary(getAnalyticsSummary());
    runPerformanceTests();
  };

  // Get recent events for timeline
  const recentEvents = analyticsData.events.slice(-20).reverse();

  // Performance status
  const getPerformanceStatus = () => {
    if (perfSummary.lcpStatus === 'good' && perfSummary.successRate >= 90) return 'excellent';
    if (perfSummary.lcpStatus !== 'poor' && perfSummary.successRate >= 70) return 'good';
    if (perfSummary.successRate >= 50) return 'warning';
    return 'critical';
  };

  const performanceStatus = getPerformanceStatus();
  const statusColors = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Adsterra</h1>
          <p className="text-muted-foreground">
            Surveillance en temps réel des performances publicitaires
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impressions</p>
                <p className="text-2xl font-bold">{analyticsSummary.totalImpressions}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CTR</p>
                <p className="text-2xl font-bold">{analyticsSummary.ctr}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LCP</p>
                <p className="text-2xl font-bold">{perfSummary.lcp}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <Badge className={statusColors[performanceStatus]}>
                  {performanceStatus}
                </Badge>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="testing">Tests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé des Performances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">{perfSummary.successRate}%</div>
                  <div className="text-xs text-muted-foreground">Taux de succès</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{perfSummary.avgLoadTime}ms</div>
                  <div className="text-xs text-muted-foreground">Temps de chargement</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{perfSummary.networkQuality}</div>
                  <div className="text-xs text-muted-foreground">Qualité réseau</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{analyticsSummary.totalClicks}</div>
                  <div className="text-xs text-muted-foreground">Total clics</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{analyticsSummary.errorRate}%</div>
                  <div className="text-xs text-muted-foreground">Taux d'erreur</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{perfSummary.totalEvents}</div>
                  <div className="text-xs text-muted-foreground">Événements</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Activité Récente</CardTitle>
                  {recentEvents.length > 0 && (
                    <Badge variant="secondary">{recentEvents.length}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recentEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Aucune activité récente
                    </p>
                  ) : (
                    recentEvents.map((event, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded text-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          event.type === 'error' ? 'bg-red-500' : 
                          event.type === 'click' ? 'bg-green-500' : 
                          event.type === 'impression' ? 'bg-blue-500' : 'bg-gray-500'
                        }`} />
                        <div className="flex-1">
                          <span className="font-medium">{event.type}</span>
                          <span className="text-muted-foreground ml-2">{event.zoneId}</span>
                          <div className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Alertes Système</CardTitle>
                  <Button onClick={clearAlerts} variant="outline" size="sm">
                    Effacer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Aucune alerte
                    </p>
                  ) : (
                    alerts.slice(-10).reverse().map((alert) => (
                      <div key={alert.id} className="flex items-start gap-2 p-2 rounded text-sm">
                        <AlertCircle className={`h-4 w-4 mt-0.5 ${
                          alert.type === 'error' ? 'text-red-500' : 
                          alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </div>
                          <p>{alert.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diagnostics">
          <AdsterraDiagnostic />
        </TabsContent>

        <TabsContent value="testing">
          <AdTestRunner />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Zone Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance par Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analyticsSummary.zones.impressions).map(([zoneId, impressions]) => {
                  const clicks = (analyticsSummary.zones.clicks[zoneId] as number) || 0;
                  const errors = (analyticsSummary.zones.errors[zoneId] as number) || 0;
                  const impressionCount = impressions as number;
                  const ctr = impressionCount > 0 ? ((clicks / impressionCount) * 100).toFixed(2) : '0.00';
                  const errorRate = impressionCount > 0 ? ((errors / impressionCount) * 100).toFixed(2) : '0.00';

                  return (
                    <div key={zoneId} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="font-medium">{zoneId}</div>
                        <div className="text-sm text-muted-foreground">
                          {impressionCount} impressions • {clicks} clics
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{ctr}% CTR</div>
                        <div className="text-xs text-muted-foreground">{errorRate}% erreurs</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdMonitoringDashboard;