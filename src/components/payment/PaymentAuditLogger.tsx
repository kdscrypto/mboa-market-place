
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Filter, 
  Download, 
  Search,
  Calendar,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';

interface AuditLog {
  id: string;
  transaction_id: string;
  event_type: string;
  event_data: any;
  ip_address: string;
  user_agent: string;
  security_flags: any;
  created_at: string;
}

interface AuditFilters {
  startDate: string;
  endDate: string;
  eventType: string;
  transactionId: string;
}

const PaymentAuditLogger: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filters, setFilters] = useState<AuditFilters>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    eventType: '',
    transactionId: ''
  });
  const { toast } = useToast();

  const eventTypes = [
    'payment_created',
    'payment_completed',
    'payment_failed',
    'payment_retry_attempt',
    'payment_retry_success',
    'payment_retry_failed',
    'lygos_callback_processed',
    'transaction_expired',
    'lock_attempt',
    'lock_released',
    'security_event_detected'
  ];

  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('payment_audit_logs')
        .select('*')
        .gte('created_at', filters.startDate + 'T00:00:00Z')
        .lte('created_at', filters.endDate + 'T23:59:59Z')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters.transactionId) {
        query = query.eq('transaction_id', filters.transactionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAuditLogs(data || []);
      
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: "Erreur d'audit",
        description: "Impossible de charger les journaux d'audit",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportAuditLogs = async () => {
    try {
      const csvData = auditLogs.map(log => ({
        Date: new Date(log.created_at).toLocaleString(),
        'Transaction ID': log.transaction_id,
        'Event Type': log.event_type,
        'IP Address': log.ip_address,
        'User Agent': log.user_agent,
        'Event Data': JSON.stringify(log.event_data),
        'Security Flags': JSON.stringify(log.security_flags)
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${filters.startDate}-${filters.endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Les journaux d'audit ont été exportés avec succès",
      });
      
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les journaux d'audit",
        variant: "destructive"
      });
    }
  };

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
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres des Journaux d'Audit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Date de début</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date de fin</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type d'événement</label>
              <Select 
                value={filters.eventType} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, eventType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">ID Transaction</label>
              <Input
                placeholder="ID Transaction"
                value={filters.transactionId}
                onChange={(e) => setFilters(prev => ({ ...prev, transactionId: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button onClick={loadAuditLogs} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button onClick={exportAuditLogs} variant="outline" disabled={auditLogs.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs List */}
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
                  onClick={() => setSelectedLog(log)}
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

      {/* Selected Log Details */}
      {selectedLog && (
        <Card className="border-blue-300 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Détails du Journal d'Audit
              </CardTitle>
              <Button onClick={() => setSelectedLog(null)} variant="outline" size="sm">
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
      )}
    </div>
  );
};

export default PaymentAuditLogger;
