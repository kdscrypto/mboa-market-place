
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuditLog, AuditFilters } from '@/types/audit';

export const useAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadAuditLogs = useCallback(async (filters: AuditFilters) => {
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

      // Type conversion avec gestion des valeurs nulles
      const typedData: AuditLog[] = (data || []).map(item => ({
        ...item,
        ip_address: item.ip_address || '',
        user_agent: item.user_agent || ''
      }));

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
  }, [toast]);

  const exportAuditLogs = useCallback(async (logs: AuditLog[], filters: AuditFilters) => {
    try {
      const csvData = logs.map(log => ({
        Date: new Date(log.created_at).toLocaleString(),
        'Transaction ID': log.transaction_id,
        'Event Type': log.event_type,
        'IP Address': log.ip_address || '',
        'User Agent': log.user_agent || '',
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
  }, [toast]);

  return {
    auditLogs,
    isLoading,
    loadAuditLogs,
    exportAuditLogs
  };
};
