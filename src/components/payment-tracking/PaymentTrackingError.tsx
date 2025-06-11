
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentTrackingErrorProps {
  error: string | null;
}

const PaymentTrackingError: React.FC<PaymentTrackingErrorProps> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <Button
        onClick={() => navigate(-1)}
        variant="ghost"
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      
      <Alert className="border-red-300 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Erreur de chargement</strong>
          <br />
          {error || 'Transaction non trouvée'}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PaymentTrackingError;
