
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Database, Server, Users, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: string;
  description: string;
  icon: React.ReactNode;
}

const SystemHealthCheck: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const checkSystemHealth = async () => {
    setIsLoading(true);
    const healthMetrics: HealthMetric[] = [];

    try {
      // Check database connectivity
      const { data: dbTest, error: dbError } = await supabase
        .from('ads')
        .select('count(*)', { count: 'exact' })
        .limit(1);

      healthMetrics.push({
        name: 'Base de données',
        status: dbError ? 'critical' : 'healthy',
        value: dbError ? 'Erreur de connexion' : 'Connectée',
        description: 'Connectivité à la base de données Supabase',
        icon: <Database className="h-5 w-5" />
      });

      // Check ads count and status
      const { data: adsStats } = await supabase
        .from('ads')
        .select('status')
        .eq('ad_type', 'standard');

      const totalAds = adsStats?.length || 0;
      const approvedAds = adsStats?.filter(ad => ad.status === 'approved').length || 0;

      healthMetrics.push({
        name: 'Annonces',
        status: totalAds > 0 ? 'healthy' : 'warning',
        value: `${totalAds} total, ${approvedAds} approuvées`,
        description: 'Statistiques des annonces dans le système',
        icon: <Activity className="h-5 w-5" />
      });

      // Check payment transactions status
      const { data: transactionStats } = await supabase
        .from('payment_transactions')
        .select('status');

      const obsoleteTransactions = transactionStats?.filter(t => t.status === 'obsolete').length || 0;
      const totalTransactions = transactionStats?.length || 0;

      healthMetrics.push({
        name: 'Transactions',
        status: obsoleteTransactions === totalTransactions ? 'healthy' : 'warning',
        value: `${obsoleteTransactions}/${totalTransactions} obsolètes`,
        description: 'État des transactions de paiement',
        icon: <Server className="h-5 w-5" />
      });

      // Check user profiles
      const { data: userStats } = await supabase
        .from('user_profiles')
        .select('role');

      const totalUsers = userStats?.length || 0;

      healthMetrics.push({
        name: 'Utilisateurs',
        status: totalUsers > 0 ? 'healthy' : 'warning',
        value: `${totalUsers} profils`,
        description: 'Nombre de profils utilisateurs',
        icon: <Users className="h-5 w-5" />
      });

      setMetrics(healthMetrics);

    } catch (error) {
      console.error('Error checking system health:', error);
      healthMetrics.push({
        name: 'Erreur système',
        status: 'critical',
        value: 'Échec de vérification',
        description: 'Une erreur est survenue lors de la vérification',
        icon: <AlertTriangle className="h-5 w-5" />
      });
      setMetrics(healthMetrics);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Sain';
      case 'warning':
        return 'Attention';
      case 'critical':
        return 'Critique';
      default:
        return 'Inconnu';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>État de santé du système</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={checkSystemHealth}
            disabled={isLoading}
          >
            {isLoading ? 'Vérification...' : 'Actualiser'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <h3 className="font-medium">{metric.name}</h3>
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  {getStatusText(metric.status)}
                </Badge>
              </div>
              <p className="text-lg font-semibold mb-1">{metric.value}</p>
              <p className="text-sm text-gray-600">{metric.description}</p>
            </div>
          ))}
        </div>
        
        {metrics.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <p>Aucune métrique disponible</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemHealthCheck;
