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
  Search, 
  Download, 
  Filter,
  Clock,
  User,
  Shield,
  Activity
} from 'lucide-react';
import { AuditLog, AuditFilters, AUDIT_EVENT_TYPES, convertDatabaseAuditLog } from '@/types/audit';

const PaymentAuditLogger: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    eventType: '',
    transactionId: ''
  });
  const { toast } = useToast();

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('payment_audit_logs')
        .select('*')
        .gte('created_at', `${filters.startDate}T00:00:00Z`)
        .lte('created_at', `${filters.endDate}T23:59:59Z`)
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

      // Convert database logs to our typed format
      const typedData: AuditLog[] = (data || []).map(convertDatabaseAuditLog);
      setAuditLogs(typedData);
      
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
      const csvContent = [
        ['Date/Heure', 'Type d\'événement', 'Transaction ID', 'Adresse IP', 'User Agent', 'Données'].join(','),
        ...auditLogs.map(log => [
          new Date(log.created_at).toLocaleString(),
          log.event_type,
          log.transaction_id,
          log.ip_address || '',
          log.user_agent || '',
          JSON.stringify(log.event_data).replace(/,/g, ';')
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit_logs_${filters.startDate}_${filters.endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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

  const getEventTypeIcon = (eventType: string) => {
    if (eventType.includes('security')) return <Shield className="h-4 w-4" />;
    if (eventType.includes('payment')) return <Activity className="h-4 w-4" />;
    if (eventType.includes('user')) return <User className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getEventTypeBadge = (eventType: string) => {
    if (eventType.includes('failed') || eventType.includes('error')) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    if (eventType.includes('completed') || eventType.includes('success')) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (eventType.includes('security') || eventType.includes('blocked')) {
      return 'bg-orange-100 text-orange-800 border-orange-300';
    }
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* En-tête et contrôles de filtrage */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Journaux d'Audit - Phase 5
            </CardTitle>
            <Button onClick={exportAuditLogs} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Date de début</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Date de fin</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Type d'événement</label>
              <Select value={filters.eventType} onValueChange={(value) => setFilters({ ...filters, eventType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  {AUDIT_EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">ID Transaction</label>
              <Input
                placeholder="Rechercher par ID"
                value={filters.transactionId}
                onChange={(e) => setFilters({ ...filters, transactionId: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Événements</p>
                <p className="text-xl font-bold">{auditLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Événements Sécurité</p>
                <p className="text-xl font-bold text-red-600">
                  {auditLogs.filter(log => log.event_type.includes('security')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Paiements Complétés</p>
                <p className="text-xl font-bold text-green-600">
                  {auditLogs.filter(log => log.event_type.includes('completed')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Dernière Heure</p>
                <p className="text-xl font-bold text-purple-600">
                  {auditLogs.filter(log => 
                    new Date(log.created_at) > new Date(Date.now() - 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des journaux d'audit */}
      <Card>
        <CardHeader>
          <CardTitle>Journaux d'Audit Détaillés</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mboa-orange"></div>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              Aucun journal d'audit trouvé pour les critères sélectionnés.
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getEventTypeIcon(log.event_type)}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getEventTypeBadge(log.event_type)}>
                          {log.event_type.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium">Transaction: {log.transaction_id}</p>
                      
                      {log.ip_address && (
                        <p className="text-xs text-gray-500">IP: {log.ip_address}</p>
                      )}
                      
                      {log.event_data && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer">
                            Voir les détails
                          </summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(log.event_data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>

                  {log.security_flags && Object.keys(log.security_flags).length > 0 && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      <Shield className="h-3 w-3 mr-1" />
                      Sécurité
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentAuditLogger;
