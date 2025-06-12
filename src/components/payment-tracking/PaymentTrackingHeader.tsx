
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentTrackingHeaderProps {
  onRefresh?: () => void;
}

const PaymentTrackingHeader: React.FC<PaymentTrackingHeaderProps> = ({
  onRefresh
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Suivi des paiements</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          Suivez l'état de vos transactions de paiement en temps réel avec des informations détaillées 
          sur le processus et les éventuelles actions de récupération.
        </p>
      </CardContent>
    </Card>
  );
};

export default PaymentTrackingHeader;
