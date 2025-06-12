
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMetrics {
  totalTransactions: number;
  successRate: number;
  averageProcessingTime: number;
  failureRate: number;
  pendingCount: number;
  recentErrors: string[];
  lygosApiStatus: 'healthy' | 'degraded' | 'down';
  lastUpdated: string;
}

interface PaymentPerformanceMonitorProps {
  timeWindow?: '1h' | '24h' | '7d';
  className?: string;
}

const PaymentPerformanceMonitor: React.FC<PaymentPerformanceMonitorProps> = ({
  timeWindow = '24h',
  className
}) => {
  const [metrics, setMetrics] = useState<PaymentMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      
      // Simulation de métriques pour démonstration
      // Dans un vrai système, cela viendrait d'une API de monitoring
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: PaymentMetrics = {
        totalTransactions: 156,
        successRate: 94.2,
        averageProcessingTime: 2.3,
        failureRate: 5.8,
        pendingCount: 3,
        recentErrors: [
          'Network timeout (3 occurrences)',
          'Invalid API response (1 occurrence)'
        ],
        lygosApiStatus: 'healthy',
        lastUpdated: new Date().toISOString()
      };
      
      setMetrics(mockMetrics);
      setLoading(false);
    };

    loadMetrics();
    
    // Mettre à jour les métriques toutes les 30 secondes
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, [timeWindow]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'down':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            Performance Lygos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            Performance Lygos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Impossible de charger les métriques
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            Performance Lygos ({timeWindow})
          </div>
          <Badge className={cn("text-xs", getStatusColor(metrics.lygosApiStatus))}>
            {getStatusIcon(metrics.lygosApiStatus)}
            <span className="ml-1">
              {metrics.lygosApiStatus === 'healthy' ? 'Opérationnel' : 
               metrics.lygosApiStatus === 'degraded' ? 'Dégradé' : 'Hors service'}
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Métriques principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taux de réussite</span>
              <span className="font-medium">{metrics.successRate}%</span>
            </div>
            <Progress 
              value={metrics.successRate} 
              className={cn(
                "h-2",
                metrics.successRate > 90 ? "[&>div]:bg-green-500" :
                metrics.successRate > 80 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500"
              )}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Temps moyen</span>
              <span className="font-medium">{metrics.averageProcessingTime}s</span>
            </div>
            <Progress 
              value={Math.min((5 - metrics.averageProcessingTime) / 5 * 100, 100)} 
              className="h-2 [&>div]:bg-blue-500"
            />
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <p className="text-lg font-bold text-green-600">{metrics.totalTransactions}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-orange-600">{metrics.pendingCount}</p>
            <p className="text-xs text-gray-600">En attente</p>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-red-600">{metrics.failureRate}%</p>
            <p className="text-xs text-gray-600">Échecs</p>
          </div>
        </div>

        {/* Erreurs récentes */}
        {metrics.recentErrors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Erreurs récentes</h4>
            <div className="space-y-1">
              {metrics.recentErrors.map((error, index) => (
                <p key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Dernière mise à jour: {new Date(metrics.lastUpdated).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentPerformanceMonitor;
