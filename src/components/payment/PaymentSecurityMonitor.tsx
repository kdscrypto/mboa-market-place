
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { SecurityEvent } from '@/types/security';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import SecurityStatsCards from './security/SecurityStatsCards';
import SecurityEventsList from './security/SecurityEventsList';

const PaymentSecurityMonitor: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const { 
    securityEvents, 
    securityStats, 
    isLoading, 
    loadSecurityData, 
    reviewSecurityEvent 
  } = useSecurityMonitor();

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
      {securityStats && <SecurityStatsCards stats={securityStats} />}

      <SecurityEventsList
        events={securityEvents}
        onEventSelect={setSelectedEvent}
        onRefresh={loadSecurityData}
      />

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
                <Badge className={`${selectedEvent.severity === 'critical' ? 'bg-red-600' : 
                  selectedEvent.severity === 'high' ? 'bg-orange-600' : 'bg-yellow-600'} text-white`}>
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
