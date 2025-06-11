
import React from 'react';
import { RefreshCw } from 'lucide-react';

const PaymentTrackingLoading: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-mboa-orange" />
          <p className="text-gray-600">Chargement des informations de paiement...</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentTrackingLoading;
