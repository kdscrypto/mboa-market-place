
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  function_name: string;
  execution_time_ms: number;
  created_at: string;
}

interface AggregatedMetrics {
  function_name: string;
  avg_time: number;
  min_time: number;
  max_time: number;
  total_calls: number;
}

const SecurityPerformanceMonitor: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<AggregatedMetrics[]>([]);
  const [recentMetrics, setRecentMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      // Get aggregated performance data for the last 24 hours
      const { data: aggregated, error: aggError } = await supabase
        .from('security_performance_logs')
        .select('function_name, execution_time_ms')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (aggError) throw aggError;

      // Process aggregated data
      const aggregatedMetrics: Record<string, {
        times: number[];
        total_calls: number;
      }> = {};

      aggregated?.forEach(metric => {
        if (!aggregatedMetrics[metric.function_name]) {
          aggregatedMetrics[metric.function_name] = {
            times: [],
            total_calls: 0
          };
        }
        aggregatedMetrics[metric.function_name].times.push(metric.execution_time_ms);
        aggregatedMetrics[metric.function_name].total_calls++;
      });

      const processedMetrics: AggregatedMetrics[] = Object.entries(aggregatedMetrics).map(([name, data]) => ({
        function_name: name,
        avg_time: data.times.reduce((a, b) => a + b, 0) / data.times.length,
        min_time: Math.min(...data.times),
        max_time: Math.max(...data.times),
        total_calls: data.total_calls
      }));

      setPerformanceData(processedMetrics);

      // Get recent metrics for the timeline
      const { data: recent, error: recentError } = await supabase
        .from('security_performance_logs')
        .select('function_name, execution_time_ms, created_at')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (recentError) throw recentError;
      setRecentMetrics(recent || []);

    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getPerformanceStatus = (avgTime: number) => {
    if (avgTime < 100) return { label: 'Excellent', color: 'bg-green-600', value: 90 };
    if (avgTime < 250) return { label: 'Bon', color: 'bg-blue-600', value: 70 };
    if (avgTime < 500) return { label: 'Moyen', color: 'bg-yellow-600', value: 50 };
    return { label: 'Lent', color: 'bg-red-600', value: 30 };
  };

  const getFunctionDisplayName = (functionName: string) => {
    const displayNames: Record<string, string> = {
      'detect_advanced_threats': 'Détection de Menaces',
      'check_rate_limit': 'Vérification de Limite',
      'detect_suspicious_activity': 'Activité Suspecte',
      'collect_security_metrics': 'Collection de Métriques',
      'resolve_security_alert': 'Résolution d\'Alerte'
    };
    return displayNames[functionName] || functionName;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Surveillance de Performance Sécurité</h2>
        <Button onClick={loadPerformanceData} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData.length > 0 
                ? Math.round(performanceData.reduce((acc, curr) => acc + curr.avg_time, 0) / performanceData.length)
                : 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Toutes fonctions confondues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appels Total</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData.reduce((acc, curr) => acc + curr.total_calls, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dernières 24 heures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fonctions Actives</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.length}</div>
            <p className="text-xs text-muted-foreground">
              Fonctions surveillées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par Fonction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucune donnée de performance disponible</p>
            ) : (
              performanceData.map((metric) => {
                const status = getPerformanceStatus(metric.avg_time);
                return (
                  <div key={metric.function_name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{getFunctionDisplayName(metric.function_name)}</h4>
                        <p className="text-sm text-gray-600">
                          {metric.total_calls} appels • Min: {Math.round(metric.min_time)}ms • Max: {Math.round(metric.max_time)}ms
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                        <span className="text-sm font-mono">
                          {Math.round(metric.avg_time)}ms
                        </span>
                      </div>
                    </div>
                    <Progress value={status.value} className="h-2" />
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente (1h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentMetrics.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Aucune activité récente</p>
            ) : (
              recentMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="text-sm">{getFunctionDisplayName(metric.function_name)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {new Date(metric.created_at).toLocaleTimeString('fr-FR')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {metric.execution_time_ms}ms
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPerformanceMonitor;
