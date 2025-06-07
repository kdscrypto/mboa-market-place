
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SecurityStressTest from '@/components/security/SecurityStressTest';

const SecurityIntegration = () => {
  // Récupérer les événements de sécurité récents
  const { data: securityEvents, isLoading, refetch } = useQuery({
    queryKey: ['admin-security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000
  });

  // Récupérer les métriques de sécurité
  const { data: securityMetrics } = useQuery({
    queryKey: ['admin-security-metrics'],
    queryFn: async () => {
      const [
        { data: totalEvents },
        { data: criticalEvents },
        { data: unreviewedEvents }
      ] = await Promise.all([
        supabase.from('payment_security_events').select('id', { count: 'exact', head: true }),
        supabase.from('payment_security_events').select('id', { count: 'exact', head: true }).eq('severity', 'critical'),
        supabase.from('payment_security_events').select('id', { count: 'exact', head: true }).eq('reviewed', false)
      ]);

      return {
        total: totalEvents?.length || 0,
        critical: criticalEvents?.length || 0,
        unreviewed: unreviewedEvents?.length || 0
      };
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertes critiques */}
      {securityMetrics?.critical > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{securityMetrics.critical} événements critiques</strong> détectés. 
            Une action immédiate est recommandée.
          </AlertDescription>
        </Alert>
      )}

      {/* Métriques de sécurité */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements Total</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tous événements confondus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics?.critical || 0}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent attention immédiate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non Révisés</CardTitle>
            <Eye className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics?.unreviewed || 0}</div>
            <p className="text-xs text-muted-foreground">
              En attente de révision
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Tableau de Bord Sécurité
              <Button asChild size="sm">
                <Link to="/security-dashboard">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Accédez au tableau de bord complet de sécurité pour une surveillance détaillée.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">Système Actif</Badge>
              <Badge variant="secondary">Monitoring 24/7</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Événements Récents
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {securityEvents?.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                    <span className="truncate">{event.event_type}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(event.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {!securityEvents?.length && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucun événement récent
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests de stress intégrés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tests de Stress Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SecurityStressTest />
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityIntegration;
