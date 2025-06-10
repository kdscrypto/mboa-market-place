
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

interface PerformanceMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  expiredTransactions: number;
  averageProcessingTime: number;
  successRate: number;
  totalAmount: number;
  averageAmount: number;
  peakHour: string;
  slowestTransactions: any[];
}

interface TimeframeData {
  label: string;
  value: string;
  hours: number;
}

const PaymentPerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<string>('24h');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const { toast } = useToast();

  const timeframes: TimeframeData[] = [
    { label: 'Dernières 24h', value: '24h', hours: 24 },
    { label: 'Derniers 7 jours', value: '7d', hours: 168 },
    { label: 'Derniers 30 jours', value: '30d', hours: 720 }
  ];

  useEffect(() => {
    loadPerformanceMetrics();
    const interval = setInterval(loadPerformanceMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeframe]);

  const loadPerformanceMetrics = async () => {
    setIsLoading(true);
    try {
      const selectedTimeframe = timeframes.find(t => t.value === timeframe);
      if (!selectedTimeframe) return;

      const startTime = new Date(Date.now() - selectedTimeframe.hours * 60 * 60 * 1000).toISOString();
      const previousStartTime = new Date(Date.now() - 2 * selectedTimeframe.hours * 60 * 60 * 1000).toISOString();

      // Get current period data
      const { data: transactions, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .gte('created_at', startTime)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get previous period data for comparison
      const { data: previousTransactions } = await supabase
        .from('payment_transactions')
        .select('*')
        .gte('created_at', previousStartTime)
        .lt('created_at', startTime);

      const currentMetrics = calculateMetrics(transactions || []);
      const previousMetrics = calculateMetrics(previousTransactions || []);

      setMetrics(currentMetrics);
      setComparisonData({
        previous: previousMetrics,
        current: currentMetrics
      });

    } catch (error) {
      console.error('Error loading performance metrics:', error);
      toast({
        title: "Erreur de performance",
        description: "Impossible de charger les métriques de performance",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = (transactions: any[]): PerformanceMetrics => {
    const total = transactions.length;
    const successful = transactions.filter(t => t.status === 'completed').length;
    const failed = transactions.filter(t => t.status === 'failed').length;
    const expired = transactions.filter(t => t.status === 'expired').length;

    const successRate = total > 0 ? (successful / total) * 100 : 0;
    const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const averageAmount = total > 0 ? totalAmount / total : 0;

    // Calculate average processing time for completed transactions
    const completedWithTimes = transactions.filter(t => 
      t.status === 'completed' && t.created_at && t.completed_at
    );
    
    const processingTimes = completedWithTimes.map(t => {
      const created = new Date(t.created_at).getTime();
      const completed = new Date(t.completed_at).getTime();
      return completed - created;
    });

    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;

    // Find peak hour
    const hourCounts = transactions.reduce((acc, t) => {
      const hour = new Date(t.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '0';

    // Get slowest transactions
    const slowestTransactions = completedWithTimes
      .map(t => ({
        id: t.id,
        processingTime: new Date(t.completed_at).getTime() - new Date(t.created_at).getTime(),
        amount: t.amount,
        created_at: t.created_at
      }))
      .sort((a, b) => b.processingTime - a.processingTime)
      .slice(0, 5);

    return {
      totalTransactions: total,
      successfulTransactions: successful,
      failedTransactions: failed,
      expiredTransactions: expired,
      averageProcessingTime,
      successRate,
      totalAmount,
      averageAmount,
      peakHour: `${peakHour}:00`,
      slowestTransactions
    };
  };

  const getComparisonIndicator = (current: number, previous: number, isHigherBetter: boolean = true) => {
    if (previous === 0) return null;
    
    const change = ((current - previous) / previous) * 100;
    const isImprovement = isHigherBetter ? change > 0 : change < 0;
    
    return {
      change: Math.abs(change),
      isImprovement,
      icon: isImprovement ? TrendingUp : TrendingDown,
      color: isImprovement ? 'text-green-600' : 'text-red-600'
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-mboa-orange" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Aucune donnée de performance disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Surveillance des Performances
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map(tf => (
                    <SelectItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={loadPerformanceMetrics} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{metrics.totalTransactions}</p>
                {comparisonData && (
                  <div className="flex items-center space-x-1 mt-1">
                    {(() => {
                      const indicator = getComparisonIndicator(
                        metrics.totalTransactions,
                        comparisonData.previous.totalTransactions
                      );
                      if (!indicator) return null;
                      const Icon = indicator.icon;
                      return (
                        <>
                          <Icon className={`h-3 w-3 ${indicator.color}`} />
                          <span className={`text-xs ${indicator.color}`}>
                            {indicator.change.toFixed(1)}%
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de Réussite</p>
                <p className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</p>
                {comparisonData && (
                  <div className="flex items-center space-x-1 mt-1">
                    {(() => {
                      const indicator = getComparisonIndicator(
                        metrics.successRate,
                        comparisonData.previous.successRate
                      );
                      if (!indicator) return null;
                      const Icon = indicator.icon;
                      return (
                        <>
                          <Icon className={`h-3 w-3 ${indicator.color}`} />
                          <span className={`text-xs ${indicator.color}`}>
                            {indicator.change.toFixed(1)}%
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temps Moyen</p>
                <p className="text-2xl font-bold">
                  {(metrics.averageProcessingTime / 1000 / 60).toFixed(1)}min
                </p>
                {comparisonData && (
                  <div className="flex items-center space-x-1 mt-1">
                    {(() => {
                      const indicator = getComparisonIndicator(
                        metrics.averageProcessingTime,
                        comparisonData.previous.averageProcessingTime,
                        false // Lower is better for processing time
                      );
                      if (!indicator) return null;
                      const Icon = indicator.icon;
                      return (
                        <>
                          <Icon className={`h-3 w-3 ${indicator.color}`} />
                          <span className={`text-xs ${indicator.color}`}>
                            {indicator.change.toFixed(1)}%
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Montant Total</p>
                <p className="text-2xl font-bold">
                  {(metrics.totalAmount / 1000).toFixed(0)}K XAF
                </p>
                {comparisonData && (
                  <div className="flex items-center space-x-1 mt-1">
                    {(() => {
                      const indicator = getComparisonIndicator(
                        metrics.totalAmount,
                        comparisonData.previous.totalAmount
                      );
                      if (!indicator) return null;
                      const Icon = indicator.icon;
                      return (
                        <>
                          <Icon className={`h-3 w-3 ${indicator.color}`} />
                          <span className={`text-xs ${indicator.color}`}>
                            {indicator.change.toFixed(1)}%
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Statuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Complétées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">{metrics.successfulTransactions}</Badge>
                  <span className="text-sm text-gray-500">
                    {metrics.totalTransactions > 0 
                      ? ((metrics.successfulTransactions / metrics.totalTransactions) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>Échouées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive">{metrics.failedTransactions}</Badge>
                  <span className="text-sm text-gray-500">
                    {metrics.totalTransactions > 0 
                      ? ((metrics.failedTransactions / metrics.totalTransactions) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>Expirées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{metrics.expiredTransactions}</Badge>
                  <span className="text-sm text-gray-500">
                    {metrics.totalTransactions > 0 
                      ? ((metrics.expiredTransactions / metrics.totalTransactions) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations Supplémentaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Heure de pointe:</span>
                <Badge variant="outline">{metrics.peakHour}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Montant moyen:</span>
                <span className="font-medium">
                  {metrics.averageAmount.toLocaleString()} XAF
                </span>
              </div>
              <div className="flex justify-between">
                <span>Plus lent:</span>
                <span className="font-medium">
                  {metrics.slowestTransactions.length > 0 
                    ? `${(metrics.slowestTransactions[0].processingTime / 1000 / 60).toFixed(1)} min`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slowest Transactions */}
      {metrics.slowestTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transactions les Plus Lentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.slowestTransactions.map((transaction, index) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">#{index + 1}</p>
                    <p className="text-sm text-gray-600">
                      ID: {transaction.id.substring(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {(transaction.processingTime / 1000 / 60).toFixed(1)} min
                    </p>
                    <p className="text-sm text-gray-600">
                      {transaction.amount.toLocaleString()} XAF
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentPerformanceMonitor;
