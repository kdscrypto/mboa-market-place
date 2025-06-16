
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useAdvancedSecurity } from '@/hooks/useAdvancedSecurity';

const AdvancedSecurityDashboard: React.FC = () => {
  const {
    isLoading,
    securityAlerts,
    securityMetrics,
    resolveAlert,
    loadSecurityAlerts,
    loadSecurityMetrics,
    runMetricsCollection
  } = useAdvancedSecurity();

  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-blue-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const handleResolveAlert = async (alertId: string, action: 'investigating' | 'resolved' | 'false_positive') => {
    await resolveAlert(alertId, action);
    setSelectedAlert(null);
  };

  const criticalAlerts = securityAlerts.filter(alert => alert.severity === 'critical');
  const highAlerts = securityAlerts.filter(alert => alert.severity === 'high');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-mboa-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalAlerts.length} alertes critiques</strong> nécessitent une action immédiate!
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {criticalAlerts.length} critiques, {highAlerts.length} élevées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements/Heure</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityMetrics['high_risk_events_hourly'] || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Risque élevé dernière heure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tentatives Échouées</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityMetrics['failed_logins_15min'] || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Derniers 15 minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(securityMetrics['avg_security_function_performance_ms'] || 0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Temps d'exécution moyen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
            <TabsTrigger value="metrics">Métriques</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button onClick={loadSecurityAlerts} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button onClick={runMetricsCollection} variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Collecter Métriques
            </Button>
          </div>
        </div>

        <TabsContent value="alerts" className="space-y-4">
          {securityAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-medium">Aucune alerte active</h3>
                <p className="text-sm">Tous les systèmes fonctionnent normalement</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {securityAlerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-red-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <h3 className="font-medium">{alert.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Score: {alert.risk_score}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {selectedAlert === alert.id && (
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Source:</strong> {alert.source_identifier} ({alert.source_type})
                          </div>
                          <div>
                            <strong>Créé:</strong> {new Date(alert.created_at).toLocaleString('fr-FR')}
                          </div>
                        </div>
                        
                        {alert.description && (
                          <p className="text-sm text-gray-600">{alert.description}</p>
                        )}
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id, 'investigating')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Investiguer
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id, 'resolved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Résoudre
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveAlert(alert.id, 'false_positive')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Fausse Alerte
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métriques Temps Réel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(securityMetrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <Badge variant="secondary">
                        {typeof value === 'number' ? Math.round(value) : value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>État du Système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Détection de Menaces</span>
                    <Badge className="bg-green-600">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Surveillance Comportementale</span>
                    <Badge className="bg-green-600">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Analyse Géographique</span>
                    <Badge className="bg-green-600">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Protection Anti-DDoS</span>
                    <Badge className="bg-green-600">Actif</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patterns de Menaces Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Tentatives de Connexion Rapides</h4>
                    <p className="text-sm text-gray-600">Détection des attaques par force brute</p>
                    <Badge className="mt-2 bg-orange-600">Poids: 25</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Patterns de Paiement Suspects</h4>
                    <p className="text-sm text-gray-600">Analyse comportementale des transactions</p>
                    <Badge className="mt-2 bg-red-600">Poids: 30</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Anomalies Géographiques</h4>
                    <p className="text-sm text-gray-600">Détection de connexions inhabituelles</p>
                    <Badge className="mt-2 bg-yellow-600">Poids: 20</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Empreintes d'Appareils</h4>
                    <p className="text-sm text-gray-600">Surveillance des nouveaux appareils</p>
                    <Badge className="mt-2 bg-purple-600">Poids: 35</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedSecurityDashboard;
