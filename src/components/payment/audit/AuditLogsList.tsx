
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, RefreshCw, Eye, AlertCircle } from 'lucide-react';
import { AuditLog } from '@/types/audit';

interface AuditLogsListProps {
  auditLogs: AuditLog[];
  isLoading: boolean;
  onLogSelect: (log: AuditLog) => void;
}

const AuditLogsList: React.FC<AuditLogsListProps> = ({
  auditLogs,
  isLoading,
  onLogSelect
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Journaux d'Audit ({auditLogs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-mboa-orange" />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun journal d'audit trouvé pour cette période</p>
          </div>
        ) : (
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div 
                key={log.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onLogSelect(log)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getEventTypeBadgeColor(log.event_type)}>
                          {log.event_type}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Transaction: {log.transaction_id.substring(0, 8)}...
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {log.security_flags && Object.keys(log.security_flags).length > 0 && (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {log.ip_address && (
                  <p className="text-xs text-gray-500 mt-2">
                    IP: {log.ip_address}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogsList;
