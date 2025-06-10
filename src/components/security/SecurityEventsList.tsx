
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';

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

interface SecurityEventsListProps {
  events: SecurityEvent[] | undefined;
  loading: boolean;
}

const SecurityEventsList: React.FC<SecurityEventsListProps> = ({ events, loading }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Shield className="h-4 w-4 text-yellow-600" />;
      case 'low': return <Shield className="h-4 w-4 text-blue-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Événements de Sécurité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mboa-orange"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Événements de Sécurité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun événement de sécurité récent</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Événements de Sécurité ({events.length})</span>
          <Badge variant="outline">{events.filter(e => !e.reviewed).length} non examinés</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(event.severity)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={getSeverityColor(event.severity)}>
                        {event.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{event.event_type}</span>
                      {event.auto_blocked && (
                        <Badge variant="destructive" className="text-xs">
                          AUTO-BLOQUÉ
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Identifiant:</span> {event.identifier} 
                        <span className="text-xs ml-2">({event.identifier_type})</span>
                      </p>
                      <p>
                        <span className="font-medium">Score de risque:</span> {event.risk_score}/100
                      </p>
                      <div className="flex items-center space-x-2 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(event.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    {event.event_data && Object.keys(event.event_data).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer">
                          Voir les détails
                        </summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-auto">
                          {JSON.stringify(event.event_data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {event.reviewed ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs">Examiné</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <XCircle className="h-4 w-4" />
                      <span className="text-xs">En attente</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityEventsList;
