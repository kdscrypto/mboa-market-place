
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentTrackingHeaderProps {
  onRefresh: () => void;
}

const PaymentTrackingHeader: React.FC<PaymentTrackingHeaderProps> = ({ onRefresh }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <Button
        onClick={() => navigate(-1)}
        variant="ghost"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      
      <Button
        onClick={onRefresh}
        variant="outline"
        size="sm"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Actualiser
      </Button>
    </div>
  );
};

export default PaymentTrackingHeader;
