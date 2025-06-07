
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const ModeratorInfoAlert = () => {
  return (
    <Alert>
      <Shield className="h-4 w-4" />
      <AlertDescription>
        Seuls les administrateurs peuvent promouvoir ou rétrograder des modérateurs. 
        Toutes les actions sont enregistrées pour audit.
      </AlertDescription>
    </Alert>
  );
};

export default ModeratorInfoAlert;
