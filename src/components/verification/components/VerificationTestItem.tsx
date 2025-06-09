
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { VerificationTest } from '../types/verificationTypes';

interface VerificationTestItemProps {
  test: VerificationTest;
}

const VerificationTestItem: React.FC<VerificationTestItemProps> = ({ test }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Succès</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Avertissement</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Échec</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">En attente</Badge>;
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {getStatusIcon(test.status)}
          <div>
            <h3 className="font-medium">{test.name}</h3>
            <p className="text-sm text-gray-600">{test.description}</p>
          </div>
        </div>
        {getStatusBadge(test.status)}
      </div>
      
      {test.message && (
        <p className="text-sm mt-2 text-gray-700">{test.message}</p>
      )}
      
      {test.details && (
        <details className="mt-2">
          <summary className="text-sm text-blue-600 cursor-pointer">
            Voir les détails
          </summary>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
            {JSON.stringify(test.details, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default VerificationTestItem;
