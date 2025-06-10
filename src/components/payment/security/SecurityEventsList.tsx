
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, RefreshCw, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { SecurityEvent } from '@/types/security';

interface SecurityEventsListProps {
  events: SecurityEvent[];
  onEventSelect: (event: SecurityEvent) => void;
  onRefresh: () => void;
}

const SecurityEventsList: React.FC<SecurityEventsListProps> = ({
  events,
  onEventSelect,
  onRefresh
}) => {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Événements de Sécurité
          </CardTitle>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Aucun événement de sécurité détecté. Le système fonctionne normalement.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onEventSelect(event)}
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
  );
};

export default SecurityEventsList;
