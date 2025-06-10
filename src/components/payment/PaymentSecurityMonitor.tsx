
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Activity,
  TrendingUp,
  RefreshCw,
  Clock,
  Ban
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  identifier: string;
  identifier_type: string;
  risk_score: number;
  auto_blocked: boolean;
  reviewed: boolean;
  created_at: string;
  event_data: any;
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
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      // Load recent security events
      const { data: events, error: eventsError } = await supabase
        .from('payment_security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) throw eventsError;

      setSecurityEvents(events || []);

      // Calculate security statistics
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
            ...selectedEvent?.event_data,
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
      setSelectedEvent(null);
      
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
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-blue-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'rapid_payment_attempts': return <TrendingUp className="h-4 w-4" />;
      case 'multiple_payment_failures': return <AlertTriangle className="h-4 w-4" />;
      case 'high_amount_transaction': return <Activity className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
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

  return (
    <div className="space-y-6">
      {/* Security Statistics */}
      {securityStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-xl font-bold">{securityStats.total_events}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">High Risk</p>
                  <p className="text-xl font-bold text-orange-600">{securityStats.high_risk_events}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Ban className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Auto Blocked</p>
                  <p className="text-xl font-bold text-red-600">{securityStats.auto_blocked_events}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-xl font-bold text-yellow-600">{securityStats.pending_review}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Last 24h</p>
                  <p className="text-xl font-bold text-green-600">{securityStats.last_24h_events}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Events List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Événements de Sécurité
            </CardTitle>
            <Button onClick={loadSecurityData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {securityEvents.length === 0 ? (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Aucun événement de sécurité détecté. Le système fonctionne normalement.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getEventTypeIcon(event.event_type)}
                      <div>
                        <p className="font-medium">{event.event_type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-600">
                          {event.identifier_type}: {event.identifier}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      {event.auto_blocked && (
                        <Badge variant="destructive">Bloqué</Badge>
                      )}
                      {!event.reviewed && event.severity !== 'low' && (
                        <Badge variant="outline">À examiner</Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        Score: {event.risk_score}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Détails de l'Événement de Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Type:</p>
                <p>{selectedEvent.event_type.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="font-medium">Sévérité:</p>
                <Badge className={getSeverityColor(selectedEvent.severity)}>
                  {selectedEvent.severity}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Score de Risque:</p>
                <p>{selectedEvent.risk_score}/100</p>
              </div>
              <div>
                <p className="font-medium">Bloqué Automatiquement:</p>
                <p>{selectedEvent.auto_blocked ? 'Oui' : 'Non'}</p>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">Données de l'Événement:</p>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(selectedEvent.event_data, null, 2)}
              </pre>
            </div>

            {!selectedEvent.reviewed && (selectedEvent.severity === 'high' || selectedEvent.severity === 'critical') && (
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => reviewSecurityEvent(selectedEvent.id, true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approuver
                </Button>
                <Button
                  onClick={() => reviewSecurityEvent(selectedEvent.id, false)}
                  variant="destructive"
                >
                  Rejeter
                </Button>
                <Button
                  onClick={() => setSelectedEvent(null)}
                  variant="outline"
                >
                  Fermer
                </Button>
              </div>
            )}

            {selectedEvent.reviewed && (
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Cet événement a été examiné le {new Date(selectedEvent.created_at).toLocaleString()}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentSecurityMonitor;
