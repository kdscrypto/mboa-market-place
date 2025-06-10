
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, RefreshCw, Download } from 'lucide-react';
import { AuditFilters as AuditFiltersType, AUDIT_EVENT_TYPES } from '@/types/audit';

interface AuditFiltersProps {
  filters: AuditFiltersType;
  onFiltersChange: (filters: AuditFiltersType) => void;
  onRefresh: () => void;
  onExport: () => void;
  isLoading: boolean;
  hasData: boolean;
}

const AuditFilters: React.FC<AuditFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  onExport,
  isLoading,
  hasData
}) => {
  return (
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
              onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Date de fin</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Type d'événement</label>
            <Select 
              value={filters.eventType} 
              onValueChange={(value) => onFiltersChange({ ...filters, eventType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                {AUDIT_EVENT_TYPES.map(type => (
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
              onChange={(e) => onFiltersChange({ ...filters, transactionId: e.target.value })}
            />
          </div>
        </div>
        <div className="flex space-x-2 mt-4">
          <Button onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button onClick={onExport} variant="outline" disabled={!hasData}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditFilters;
