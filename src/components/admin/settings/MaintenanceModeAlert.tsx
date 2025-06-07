
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface MaintenanceModeAlertProps {
  isMaintenanceMode: boolean;
}

const MaintenanceModeAlert = ({ isMaintenanceMode }: MaintenanceModeAlertProps) => {
  if (!isMaintenanceMode) return null;

  return (
    <Alert className="border-orange-300 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <strong>Mode maintenance activé.</strong> La plateforme est actuellement inaccessible aux utilisateurs.
      </AlertDescription>
    </Alert>
  );
};

export default MaintenanceModeAlert;
