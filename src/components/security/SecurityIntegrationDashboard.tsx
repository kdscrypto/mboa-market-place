
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, Activity, AlertTriangle, CheckCircle, TrendingUp, Users, Lock, Eye } from 'lucide-react';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { cleanupSecurityEvents } from '@/services/securityService';

interface SecurityMetrics {
  totalAttempts: number;
  failedAttempts: number;
  suspiciousInputs: number;
  blockedInputs: number;
  loginAttempts: any[];
  validationLogs: any[];
}

const SecurityIntegrationDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [integrationStatus, setIntegrationStatus] = useState('active');
  const { toast } = useToast();
  const { getSecurityMetrics } = useEnhancedSecurity();

  useEffect(() => {
    loadSecurityMetrics();
  }, []);

  const loadSecurityMetrics = async () => {
    try {
      setLoading(true);
      const data = await getSecurityMetrics();
      if (data) {
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to load security metrics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les métriques de sécurité",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupSecurityLogs = async () => {
    try {
      await cleanupSecurityEvents();
      toast({
        title: "Nettoyage terminé",
        description: "Les anciens journaux de sécurité ont été supprimés",
      });
      await loadSecurityMetrics();
    } catch (error) {
      toast({
        title: "Erreur de nettoyage",
        description: "Impossible de nettoyer les journaux de sécurité",
        variant: "destructive"
      });
    }
  };

  const getSecurityLevel = () => {
    if (!metrics) return 'unknown';
    const failureRate = metrics.totalAttempts > 0 ? (metrics.failedAttempts / metrics.totalAttempts) * 100 : 0;
    
    if (failureRate > 50 || metrics.suspiciousInputs > 10) return 'critical';
    if (failureRate > 25 || metrics.suspiciousInputs > 5) return 'warning';
    return 'good';
  };

  const getSecurityLevelColor = () => {
    const level = getSecurityLevel();
    switch (level) {
      case 'critical': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'good': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getSecurityLevelText = () => {
    const level = getSecurityLevel();
    switch (level) {
      case 'critical': return 'Critique';
      case 'warning': return 'Attention';
      case 'good': return 'Bon';
      default: return 'Inconnu';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intégration de Sécurité - Phase 3</h2>
          <p className="text-gray-600">Surveillance avancée et métriques de sécurité</p>
        </div>
        <Badge variant={integrationStatus === 'active' ? 'default' : 'destructive'}>
          {integrationStatus === 'active' ? 'Actif' : 'Inactif'}
        </Badge>
      </div>

      {/* Status Alert */}
      <Alert className={`border-l-4 ${getSecurityLevel() === 'critical' ? 'border-l-red-500 bg-red-50' : 
        getSecurityLevel() === 'warning' ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-green-500 bg-green-50'}`}>
        <Shield className={`h-4 w-4 ${getSecurityLevelColor()}`} />
        <AlertDescription>
          <span className="font-semibold">Niveau de sécurité: </span>
          <span className={getSecurityLevelColor()}>{getSecurityLevelText()}</span>
          {getSecurityLevel() === 'critical' && (
            <span className="ml-2">- Action immédiate requise</span>
          )}
        </AlertDescription>
      </Alert>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tentatives de connexion</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalAttempts || 0}</div>
            <p className="text-xs text-muted-foreground">Dernières 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Échecs de connexion</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.failedAttempts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.totalAttempts ? 
                `${Math.round((metrics.failedAttempts / metrics.totalAttempts) * 100)}% du total` : 
                '0% du total'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées suspectes</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics?.suspiciousInputs || 0}</div>
            <p className="text-xs text-muted-foreground">Détectées automatiquement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées bloquées</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{metrics?.blockedInputs || 0}</div>
            <p className="text-xs text-muted-foreground">Menaces neutralisées</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="threats">Menaces</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Résumé de sécurité</CardTitle>
              <CardDescription>État actuel du système de sécurité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Surveillance des connexions</span>
                <Badge variant="default">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Actif
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Validation des entrées</span>
                <Badge variant="default">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Actif
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Détection d'anomalies</span>
                <Badge variant="default">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Actif
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Limitation de débit</span>
                <Badge variant="default">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Actif
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Journaux des dernières 24 heures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics?.loginAttempts?.slice(0, 5).map((attempt, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Tentative de connexion</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={attempt.success ? 'default' : 'destructive'}>
                        {attempt.success ? 'Succès' : 'Échec'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(attempt.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                {(!metrics?.loginAttempts || metrics.loginAttempts.length === 0) && (
                  <p className="text-sm text-gray-500">Aucune activité récente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse des menaces</CardTitle>
              <CardDescription>Entrées suspectes et validations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics?.validationLogs?.slice(0, 5).map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Validation d'entrée</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        log.validation_result === 'failed' ? 'destructive' : 
                        log.validation_result === 'suspicious' ? 'outline' : 'default'
                      }>
                        {log.validation_result === 'failed' ? 'Bloqué' : 
                         log.validation_result === 'suspicious' ? 'Suspect' : 'Validé'}
                      </Badge>
                      <Badge variant="secondary">{log.severity}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                {(!metrics?.validationLogs || metrics.validationLogs.length === 0) && (
                  <p className="text-sm text-gray-500">Aucune validation récente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance du système</CardTitle>
              <CardDescription>Outils de gestion et maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Nettoyage des journaux</h4>
                  <p className="text-sm text-gray-600">Supprimer les anciens journaux de sécurité</p>
                </div>
                <Button onClick={handleCleanupSecurityLogs} variant="outline">
                  Nettoyer
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Actualiser les métriques</h4>
                  <p className="text-sm text-gray-600">Recharger les données de sécurité</p>
                </div>
                <Button onClick={loadSecurityMetrics} variant="outline">
                  Actualiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityIntegrationDashboard;
