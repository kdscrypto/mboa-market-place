
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { AuditLog } from '@/types/audit';

interface AuditLogDetailsProps {
  selectedLog: AuditLog;
  onClose: () => void;
}

const AuditLogDetails: React.FC<AuditLogDetailsProps> = ({
  selectedLog,
  onClose
}) => {
  const getEventTypeBadgeColor = (eventType: string) => {
    if (eventType.includes('failed') || eventType.includes('expired')) {
      return 'destructive';
    }
    if (eventType.includes('success') || eventType.includes('completed')) {
      return 'default';
    }
    if (eventType.includes('security') || eventType.includes('lock')) {
      return 'secondary';
    }
    return 'outline';
  };

  return (
    <Card className="border-blue-300 bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Détails du Journal d'Audit
          </CardTitle>
          <Button onClick={onClose} variant="outline" size="sm">
            Fermer
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">ID Journal:</p>
            <p className="text-sm">{selectedLog.id}</p>
          </div>
          <div>
            <p className="font-medium">Transaction ID:</p>
            <p className="text-sm">{selectedLog.transaction_id}</p>
          </div>
          <div>
            <p className="font-medium">Type d'événement:</p>
            <Badge variant={getEventTypeBadgeColor(selectedLog.event_type)}>
              {selectedLog.event_type}
            </Badge>
          </div>
          <div>
            <p className="font-medium">Date/Heure:</p>
            <p className="text-sm">{new Date(selectedLog.created_at).toLocaleString()}</p>
          </div>
        </div>

        {selectedLog.ip_address && (
          <div>
            <p className="font-medium">Adresse IP:</p>
            <p className="text-sm">{selectedLog.ip_address}</p>
          </div>
        )}

        {selectedLog.user_agent && (
          <div>
            <p className="font-medium">User Agent:</p>
            <p className="text-sm break-all">{selectedLog.user_agent}</p>
          </div>
        )}

        <div>
          <p className="font-medium mb-2">Données de l'événement:</p>
          <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-64">
            {JSON.stringify(selectedLog.event_data, null, 2)}
          </pre>
        </div>

        {selectedLog.security_flags && Object.keys(selectedLog.security_flags).length > 0 && (
          <div>
            <p className="font-medium mb-2">Drapeaux de sécurité:</p>
            <pre className="bg-orange-100 p-3 rounded border text-xs overflow-auto">
              {JSON.stringify(selectedLog.security_flags, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogDetails;
