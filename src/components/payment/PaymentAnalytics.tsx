
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface PaymentStats {
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalRevenue: number;
  averageAmount: number;
  successRate: number;
  recentTransactions: any[];
}

interface PaymentAnalyticsProps {
  userId?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

const PaymentAnalytics: React.FC<PaymentAnalyticsProps> = ({
  userId,
  timeRange = 'month'
}) => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPaymentStats();
  }, [userId, timeRange]);

  const getTimeRangeFilter = () => {
    const now = new Date();
    const ranges = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };
    
    return ranges[timeRange].toISOString();
  };

  const loadPaymentStats = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('payment_transactions')
        .select('*')
        .gte('created_at', getTimeRangeFilter());

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: transactions, error } = await query;

      if (error) throw error;

      // Calculate statistics
      const totalTransactions = transactions?.length || 0;
      const successfulPayments = transactions?.filter(t => t.status === 'completed').length || 0;
      const failedPayments = transactions?.filter(t => ['failed', 'expired', 'cancelled'].includes(t.status)).length || 0;
      const pendingPayments = transactions?.filter(t => t.status === 'pending').length || 0;
      
      const totalRevenue = transactions
        ?.filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0) || 0;
      
      const averageAmount = totalTransactions > 0 ? totalRevenue / successfulPayments : 0;
      const successRate = totalTransactions > 0 ? (successfulPayments / totalTransactions) * 100 : 0;

      // Get recent transactions (last 5)
      const recentTransactions = transactions
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5) || [];

      setStats({
        totalTransactions,
        successfulPayments,
        failedPayments,
        pendingPayments,
        totalRevenue,
        averageAmount,
        successRate,
        recentTransactions
      });

    } catch (error) {
      console.error('Error loading payment stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'expired':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      expired: 'secondary',
      cancelled: 'outline',
      pending: 'outline'
    } as const;

    const labels = {
      completed: 'Réussi',
      failed: 'Échec',
      expired: 'Expiré',
      cancelled: 'Annulé',
      pending: 'En attente'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status as keyof typeof labels] || status}</span>
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </div>
              <DollarSign className="h-8 w-8 text-mboa-orange" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de réussite</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.successRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                <p className="text-2xl font-bold text-mboa-orange">
                  {stats.totalRevenue.toLocaleString()} XAF
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-mboa-orange" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Montant moyen</p>
                <p className="text-2xl font-bold">
                  {stats.averageAmount.toLocaleString()} XAF
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.successfulPayments}</p>
              <p className="text-sm text-gray-600">Paiements réussis</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
              <p className="text-sm text-gray-600">En attente</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failedPayments}</p>
              <p className="text-sm text-gray-600">Échecs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune transaction récente</p>
          ) : (
            <div className="space-y-3">
              {stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(transaction.status)}
                    <div>
                      <p className="font-medium">{transaction.amount.toLocaleString()} {transaction.currency}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentAnalytics;
