
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Clock, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface PerformanceMetrics {
  totalTransactions: number;
  successRate: number;
  averageProcessingTime: number;
  failureRate: number;
  timeoutRate: number;
  volumeGrowth: number;
}

const PaymentPerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadPerformanceMetrics = async () => {
    setIsLoading(true);
    try {
      const hoursBack = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720;
      const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

      const { data: transactions, error } = await supabase
        .from('payment_transactions')
        .select('status, created_at, completed_at')
        .gte('created_at', startTime);

      if (error) throw error;

      const totalTransactions = transactions?.length || 0;
      const successfulTransactions = transactions?.filter(t => t.status === 'completed').length || 0;
      const failedTransactions = transactions?.filter(t => t.status === 'failed').length || 0;
      const timeoutTransactions = transactions?.filter(t => t.status === 'expired').length || 0;

      // Calculer le temps de traitement moyen pour les transactions réussies
      const completedTransactions = transactions?.filter(t => t.status === 'completed' && t.completed_at) || [];
      const totalProcessingTime = completedTransactions.reduce((sum, t) => {
        const processingTime = new Date(t.completed_at!).getTime() - new Date(t.created_at).getTime();
        return sum + processingTime;
      }, 0);

      const averageProcessingTime = completedTransactions.length > 0 
        ? totalProcessingTime / completedTransactions.length / 1000 / 60 // en minutes
        : 0;

      // Calculer la croissance du volume (comparaison avec la période précédente)
      const previousPeriodStart = new Date(Date.now() - 2 * hoursBack * 60 * 60 * 1000).toISOString();
      const { data: previousTransactions } = await supabase
        .from('payment_transactions')
        .select('id')
        .gte('created_at', previousPeriodStart)
        .lt('created_at', startTime);

      const previousVolume = previousTransactions?.length || 0;
      const volumeGrowth = previousVolume > 0 
        ? ((totalTransactions - previousVolume) / previousVolume) * 100 
        : 0;

      setMetrics({
        totalTransactions,
        successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0,
        averageProcessingTime,
        failureRate: totalTransactions > 0 ? (failedTransactions / totalTransactions) * 100 : 0,
        timeoutRate: totalTransactions > 0 ? (timeoutTransactions / totalTransactions) * 100 : 0,
        volumeGrowth
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

  useEffect(() => {
    loadPerformanceMetrics();
  }, [timeframe]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-mboa-orange" />
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
              Métriques de Performance
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 heures</SelectItem>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
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

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold">{metrics.totalTransactions}</p>
                  <div className="flex items-center mt-1">
                    {metrics.volumeGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${metrics.volumeGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {metrics.volumeGrowth > 0 ? '+' : ''}{metrics.volumeGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Taux de Réussite</p>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics.successRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Temps Moyen</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {metrics.averageProcessingTime.toFixed(1)}min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Taux d'Échec</p>
                  <p className="text-2xl font-bold text-red-600">
                    {metrics.failureRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Taux d'Expiration</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {metrics.timeoutRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaymentPerformanceMonitor;
