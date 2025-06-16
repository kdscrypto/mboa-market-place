
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  identifier: string;
  created_at: string;
  risk_score: number;
}

interface RealTimeStats {
  totalEvents: number;
  criticalEvents: number;
  lastEventTime: string | null;
  averageRiskScore: number;
}

const RealTimeSecurityMonitor: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<RealTimeStats>({
    totalEvents: 0,
    criticalEvents: 0,
    lastEventTime: null,
    averageRiskScore: 0
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load initial data
    loadInitialData();

    // Set up real-time subscription
    const subscription = supabase
      .channel('security_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auth_security_events'
        },
        (payload) => {
          console.log('New security event:', payload);
          const newEvent = payload.new as SecurityEvent;
          handleNewSecurityEvent(newEvent);
        }
      )
      .subscribe((status) => {
        console.log('Security monitor subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      // Load recent security events
      const { data: recentEvents, error } = await supabase
        .from('auth_security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading security events:', error);
        return;
      }

      if (recentEvents) {
        setEvents(recentEvents);
        updateStats(recentEvents);
      }
    } catch (error) {
      console.error('Error in loadInitialData:', error);
    }
  };

  const handleNewSecurityEvent = (newEvent: SecurityEvent) => {
    setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
    updateStats([newEvent, ...events]);
  };

  const updateStats = (eventList: SecurityEvent[]) => {
    const now = new Date();
    const last24h = eventList.filter(event => 
      new Date(event.created_at) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
    );

    const criticalEvents = last24h.filter(event => event.severity === 'critical').length;
    const averageRiskScore = last24h.length > 0 
      ? last24h.reduce((sum, event) => sum + (event.risk_score || 0), 0) / last24h.length 
      : 0;

    setStats({
      totalEvents: last24h.length,
      criticalEvents,
      lastEventTime: eventList.length > 0 ? eventList[0].created_at : null,
      averageRiskScore: Math.round(averageRiskScore)
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-100';
      case 'high': return 'text-orange-500 bg-orange-100';
      case 'medium': return 'text-yellow-500 bg-yellow-100';
      case 'low': return 'text-green-500 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getEventTypeDisplay = (eventType: string) => {
    switch (eventType) {
      case 'rapid_login_attempts': return 'Tentatives rapides';
      case 'multiple_login_failures': return 'Échecs multiples';
      case 'suspicious_input': return 'Entrée suspecte';
      case 'rate_limit_exceeded': return 'Limite dépassée';
      default: return eventType;
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Alert className={`border-l-4 ${isConnected ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
        <Activity className={`h-4 w-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
        <AlertDescription>
          <span className="font-semibold">Surveillance en temps réel: </span>
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </span>
        </AlertDescription>
      </Alert>

      {/* Real-time Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Total détecté</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Haute priorité</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRiskScore}</div>
            <p className="text-xs text-muted-foreground">Risque calculé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernier événement</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {stats.lastEventTime 
                ? new Date(stats.lastEventTime).toLocaleTimeString()
                : 'Aucun'
              }
            </div>
            <p className="text-xs text-muted-foreground">Heure locale</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events Stream */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Flux d'événements en temps réel
          </CardTitle>
          <CardDescription>
            Derniers événements de sécurité détectés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getSeverityColor(event.severity)}>
                    {event.severity}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">
                      {getEventTypeDisplay(event.event_type)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {event.identifier.substring(0, 10)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(event.created_at).toLocaleTimeString()}
                  </p>
                  <p className="text-xs font-medium">
                    Score: {event.risk_score || 0}
                  </p>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun événement récent</p>
                <p className="text-xs">Le système surveille en continu</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeSecurityMonitor;
