
import React, { useState, useEffect } from 'react';
import { AuditFilters, AuditLog } from '@/types/audit';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import AuditFiltersComponent from './audit/AuditFilters';
import AuditLogsList from './audit/AuditLogsList';
import AuditLogDetails from './audit/AuditLogDetails';

const PaymentAuditLogger: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filters, setFilters] = useState<AuditFilters>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    eventType: '',
    transactionId: ''
  });

  const { auditLogs, isLoading, loadAuditLogs, exportAuditLogs } = useAuditLogs();

  useEffect(() => {
    loadAuditLogs(filters);
  }, [loadAuditLogs, filters]);

  const handleExport = () => {
    exportAuditLogs(auditLogs, filters);
  };

  return (
    <div className="space-y-6">
      <AuditFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={() => loadAuditLogs(filters)}
        onExport={handleExport}
        isLoading={isLoading}
        hasData={auditLogs.length > 0}
      />

      <AuditLogsList
        auditLogs={auditLogs}
        isLoading={isLoading}
        onLogSelect={setSelectedLog}
      />

      {selectedLog && (
        <AuditLogDetails
          selectedLog={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

export default PaymentAuditLogger;
