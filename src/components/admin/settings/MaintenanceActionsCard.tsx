
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Shield } from 'lucide-react';

const MaintenanceActionsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions de Maintenance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6" />
            <span>Nettoyer le Cache</span>
            <span className="text-xs text-gray-500">Vider le cache système</span>
          </Button>

          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <Database className="h-6 w-6" />
            <span>Optimiser la DB</span>
            <span className="text-xs text-gray-500">Maintenance base de données</span>
          </Button>

          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <Shield className="h-6 w-6" />
            <span>Test Sécurité</span>
            <span className="text-xs text-gray-500">Vérifier la sécurité</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceActionsCard;
