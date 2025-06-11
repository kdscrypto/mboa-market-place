
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface PaymentTransaction {
  security_score?: number;
  processing_lock?: boolean;
  locked_by?: string;
  client_fingerprint?: string;
}

interface SecurityInfoCardProps {
  transaction: PaymentTransaction;
}

const SecurityInfoCard: React.FC<SecurityInfoCardProps> = ({ transaction }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Sécurité & Audit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Niveau de sécurité:</span> {transaction.security_score || 100}/100</p>
          <p><span className="font-medium">Verrouillage de traitement:</span> {transaction.processing_lock ? 'Actif' : 'Inactif'}</p>
          {transaction.locked_by && (
            <p><span className="font-medium">Verrouillé par:</span> {transaction.locked_by}</p>
          )}
          {transaction.client_fingerprint && (
            <p><span className="font-medium">Empreinte client:</span> {transaction.client_fingerprint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityInfoCard;
