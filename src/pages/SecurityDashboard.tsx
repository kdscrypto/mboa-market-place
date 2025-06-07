
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Users, 
  Clock,
  RefreshCw,
  Download,
  Play,
  StopCircle
} from 'lucide-react';
import SecurityMetricsChart from '@/components/security/SecurityMetricsChart';
import SecurityEventsList from '@/components/security/SecurityEventsList';
import SecurityStressTest from '@/components/security/SecurityStressTest';

const SecurityDashboard = () => {
  const { isAdmin, isAuthLoading } = useAdminAuth();
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [isRunningCleanup, setIsRunningCleanup] = useState(false);

  // Récupérer les métriques de sécurité en temps réel
  const { data: securityMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('security-cleanup', {
        method: 'POST'
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Actualiser toutes les 30 secondes
  });

  // Récupérer les événements de sécurité récents
  const { data: securityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000 // Actualiser toutes les 10 secondes
  });

  // Compter les alertes actives
  useEffect(() => {
    if (securityEvents) {
      const alerts = securityEvents.filter(event => 
        event.severity === 'critical' && 
        !event.reviewed &&
        new Date(event.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;
      setActiveAlerts(alerts);
    }
  }, [securityEvents]);

  const runSecurityCleanup = async () => {
    setIsRunningCleanup(true);
    try {
      await supabase.functions.invoke('security-cleanup', { method: 'POST' });
      await refetchMetrics();
    } catch (error) {
      console.error('Cleanup failed:', error);
    } finally {
      setIsRunningCleanup(false);
    }
  };

  const handleRefreshMetrics = async () => {
    await refetchMetrics();
  };

  const exportSecurityReport = async () => {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        metrics: securityMetrics,
        events: securityEvents?.slice(0, 100),
        summary: {
          total_events: securityEvents?.length || 0,
          critical_alerts: activeAlerts,
          block_rate: securityMetrics?.security_metrics?.block_rate_percent || 0
        }
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-mboa-orange" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 bg-mboa-gray">
          <div className="mboa-container">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Accès non autorisé. Seuls les administrateurs peuvent accéder au tableau de bord de sécurité.
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-7xl">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Tableau de Bord Sécurité</h1>
                <p className="text-gray-600 mt-2">Surveillance et gestion de la sécurité des paiements</p>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleRefreshMetrics} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualiser
                </Button>
                <Button onClick={exportSecurityReport} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                </Button>
                <Button 
                  onClick={runSecurityCleanup}
                  disabled={isRunningCleanup}
                  className="bg-mboa-orange hover:bg-mboa-orange/90"
                >
                  {isRunningCleanup ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Nettoyage
                </Button>
              </div>
            </div>
          </div>

          {/* Alertes critiques */}
          {activeAlerts > 0 && (
            <Alert className="mb-6 border-red-300 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>{activeAlerts} alertes critiques</strong> nécessitent votre attention immédiate.
              </AlertDescription>
            </Alert>
          )}

          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions Bloquées</CardTitle>
                <Shield className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {securityMetrics?.security_metrics?.blocked_transactions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Taux: {securityMetrics?.security_metrics?.block_rate_percent || 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Événements Sécurité</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {securityMetrics?.security_metrics?.security_events || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dernières 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions Totales</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {securityMetrics?.security_metrics?.total_transactions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dernières 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">IPs à Risque</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {securityMetrics?.security_metrics?.top_risk_ips?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  IPs surveillées
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Onglets du tableau de bord */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="events">Événements</TabsTrigger>
              <TabsTrigger value="testing">Tests de Stress</TabsTrigger>
              <TabsTrigger value="monitoring">Surveillance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SecurityMetricsChart data={securityMetrics} />
                <Card>
                  <CardHeader>
                    <CardTitle>Nettoyage Automatique</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {securityMetrics?.cleanup_results && (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Événements nettoyés:</span>
                          <Badge variant="secondary">
                            {securityMetrics.cleanup_results.cleaned_security_events}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Logs archivés:</span>
                          <Badge variant="secondary">
                            {securityMetrics.cleanup_results.archived_audit_logs}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Transactions chiffrées:</span>
                          <Badge variant="secondary">
                            {securityMetrics.cleanup_results.encrypted_transactions}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate limits purgés:</span>
                          <Badge variant="secondary">
                            {securityMetrics.cleanup_results.purged_rate_limits}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="events">
              <SecurityEventsList events={securityEvents} loading={eventsLoading} />
            </TabsContent>

            <TabsContent value="testing">
              <SecurityStressTest />
            </TabsContent>

            <TabsContent value="monitoring">
              <Card>
                <CardHeader>
                  <CardTitle>Surveillance Continue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h4 className="font-medium">Détection d'Anomalies</h4>
                        <p className="text-sm text-gray-600">
                          Surveillance automatique des patterns suspects
                        </p>
                      </div>
                      <Badge variant="default" className="bg-green-600">Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h4 className="font-medium">Rate Limiting</h4>
                        <p className="text-sm text-gray-600">
                          Protection contre les attaques par déni de service
                        </p>
                      </div>
                      <Badge variant="default" className="bg-green-600">Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h4 className="font-medium">Chiffrement des Données</h4>
                        <p className="text-sm text-gray-600">
                          Chiffrement automatique des données sensibles
                        </p>
                      </div>
                      <Badge variant="default" className="bg-green-600">Actif</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SecurityDashboard;
