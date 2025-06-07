
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Shield, 
  Eye, 
  Clock, 
  MapPin,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEventsListProps {
  events: any[];
  loading: boolean;
}

const SecurityEventsList = ({ events, loading }: SecurityEventsListProps) => {
  const [filter, setFilter] = useState('all');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'webhook_security_violation':
      case 'advanced_anomaly_detected':
        return <Shield className="h-4 w-4" />;
      case 'suspicious_activity_blocked':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const markAsReviewed = async (eventId: string) => {
    try {
      await supabase
        .from('payment_security_events')
        .update({ 
          reviewed: true, 
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', eventId);
      
      // Refresh the page or update the local state
      window.location.reload();
    } catch (error) {
      console.error('Failed to mark as reviewed:', error);
    }
  };

  const filteredEvents = events?.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'unreviewed') return !event.reviewed;
    if (filter === 'critical') return event.severity === 'critical';
    return event.severity === filter;
  }) || [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Événements de Sécurité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mboa-orange"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Événements de Sécurité</CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="unreviewed">Non Révisés</SelectItem>
                <SelectItem value="critical">Critiques</SelectItem>
                <SelectItem value="high">Élevés</SelectItem>
                <SelectItem value="medium">Moyens</SelectItem>
                <SelectItem value="low">Faibles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun événement trouvé pour ce filtre.
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event.event_type)}
                      <span className="font-medium">{event.event_type}</span>
                    </div>
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                    {event.auto_blocked && (
                      <Badge variant="destructive">
                        Auto-bloqué
                      </Badge>
                    )}
                    {!event.reviewed && (
                      <Badge variant="outline" className="border-orange-300 text-orange-600">
                        Non révisé
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {new Date(event.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{event.identifier}</span>
                    <Badge variant="outline" className="text-xs">
                      {event.identifier_type}
                    </Badge>
                  </div>
                  {event.risk_score && (
                    <div>
                      Score de risque: <strong>{event.risk_score}</strong>
                    </div>
                  )}
                </div>

                {expandedEvent === event.id && (
                  <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(event.event_data, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedEvent(
                      expandedEvent === event.id ? null : event.id
                    )}
                  >
                    {expandedEvent === event.id ? 'Masquer' : 'Détails'}
                  </Button>
                  {!event.reviewed && (
                    <Button
                      size="sm"
                      onClick={() => markAsReviewed(event.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Marquer comme révisé
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityEventsList;
