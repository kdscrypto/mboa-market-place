
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Clock, 
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  identifier: string;
  identifier_type: string;
  event_data: any;
  risk_score: number;
  auto_blocked: boolean;
  reviewed: boolean;
  created_at: string;
}

interface SecurityStats {
  total_events: number;
  high_risk_events: number;
  auto_blocked_events: number;
  pending_review: number;
  last_24h_events: number;
}

const PaymentSecurityMonitor: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  const loadSecurityData = async () => {
    try {
      // Charger les événements de sécurité récents
      const { data: events, error: eventsError } = await supabase
        .from('payment_security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) throw eventsError;

      setSecurityEvents(events || []);

      // Calculer les statistiques
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const stats: SecurityStats = {
        total_events: events?.length || 0,
        high_risk_events: events?.filter(e => e.severity === 'high' || e.severity === 'critical').length || 0,
        auto_blocked_events: events?.filter(e => e.auto_blocked).length || 0,
        pending_review: events?.filter(e => !e.reviewed && (e.severity === 'high' || e.severity === 'critical')).length || 0,
        last_24h_events: events?.filter(e => new Date(e.created_at) > last24h).length || 0
      };

      setSecurityStats(stats);
      
    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: "Erreur de sécurité",
        description: "Impossible de charger les données de sécurité",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reviewSecurityEvent = async (eventId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_security_events')
        .update({ 
          reviewed: true, 
          reviewed_at: new Date().toISOString(),
          event_data: {
            review_decision: approved ? 'approved' : 'rejected',
            reviewed_by: 'admin'
          }
        })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Événement examiné",
        description: `L'événement de sécurité a été ${approved ? 'approuvé' : 'rejeté'}`,
      });

      loadSecurityData();
      
    } catch (error) {
      console.error('Error reviewing security event:', error);
      toast({
        title: "Erreur d'examen",
        description: "Impossible d'examiner l'événement de sécurité",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    loadSecurityData();
    
    if (autoRefresh) {
      const interval = setInterval(loadSecurityData, 30000); // Actualiser toutes les 30 secondes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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
      {/* En-tête avec contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Surveillance de Sécurité - Phase 5</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </Button>
          <Button onClick={loadSecurityData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques de sécurité */}
      {securityStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Événements</p>
                  <p className="text-xl font-bold">{securityStats.total_events}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Haut Risque</p>
                  <p className="text-xl font-bold text-red-600">{securityStats.high_risk_events}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Auto-Bloqués</p>
                  <p className="text-xl font-bold text-orange-600">{securityStats.auto_blocked_events}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">En Attente</p>
                  <p className="text-xl font-bold text-purple-600">{securityStats.pending_review}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">24h Récentes</p>
                  <p className="text-xl font-bold text-green-600">{securityStats.last_24h_events}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des événements de sécurité */}
      <Card>
        <CardHeader>
          <CardTitle>Événements de Sécurité Récents</CardTitle>
        </CardHeader>
        <CardContent>
          {securityEvents.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Aucun événement de sécurité récent. Le système fonctionne normalement.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Badge className={getSeverityColor(event.severity)}>
                      {getSeverityIcon(event.severity)}
                      <span className="ml-1">{event.severity.toUpperCase()}</span>
                    </Badge>
                    
                    <div>
                      <p className="font-medium">{event.event_type}</p>
                      <p className="text-sm text-gray-600">
                        {event.identifier_type}: {event.identifier}
                      </p>
                      <p className="text-xs text-gray-500">
                        Score de risque: {event.risk_score} | 
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {event.auto_blocked && (
                      <Badge variant="destructive">Auto-bloqué</Badge>
                    )}
                    
                    {!event.reviewed && (event.severity === 'high' || event.severity === 'critical') && (
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => reviewSecurityEvent(event.id, true)}
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-300"
                        >
                          Approuver
                        </Button>
                        <Button
                          onClick={() => reviewSecurityEvent(event.id, false)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300"
                        >
                          Rejeter
                        </Button>
                      </div>
                    )}
                    
                    {event.reviewed && (
                      <Badge variant="secondary">Examiné</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertes système */}
      {securityStats && securityStats.pending_review > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Action requise:</strong> {securityStats.pending_review} événement(s) de sécurité 
            nécessite(nt) votre attention.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PaymentSecurityMonitor;
