
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

interface PaymentStatusContentProps {
  paymentStatus: string;
  onPaymentAction: () => void;
  lygosPaymentUrl: string | null;
}

const PaymentStatusContent: React.FC<PaymentStatusContentProps> = ({
  paymentStatus,
  onPaymentAction,
  lygosPaymentUrl
}) => {
  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-mboa-orange" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'expired':
        return <XCircle className="h-16 w-16 text-orange-500" />;
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'loading':
        return {
          title: "Chargement du statut de paiement...",
          description: "Veuillez patienter pendant que nous récupérons les informations de votre paiement."
        };
      case 'success':
        return {
          title: "Paiement réussi !",
          description: "Votre annonce premium a été activée et sera mise en avant."
        };
      case 'failed':
        return {
          title: "Paiement échoué",
          description: "Le paiement n'a pas pu être traité. Votre annonce est en attente."
        };
      case 'expired':
        return {
          title: "Paiement expiré",
          description: "Le délai de paiement a expiré. Vous pouvez créer une nouvelle transaction."
        };
      case 'pending':
        return {
          title: "En attente de paiement",
          description: "Votre transaction est en attente. Cliquez sur 'Payer sur Lygos' pour compléter votre paiement."
        };
      default:
        return { title: "", description: "" };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
      <div className="mb-6 flex justify-center">
        {getStatusIcon()}
      </div>
      
      <h1 className="text-2xl font-bold mb-4">{statusMessage.title}</h1>
      <p className="text-gray-600 mb-6">{statusMessage.description}</p>
      
      {paymentStatus !== 'loading' && (
        <div className="space-y-3">
          <Button 
            onClick={onPaymentAction}
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90 flex items-center justify-center gap-2"
          >
            {paymentStatus === 'success' 
              ? 'Aller au tableau de bord'
              : paymentStatus === 'pending'
              ? (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Payer sur Lygos
                </>
              )
              : 'Réessayer le paiement'
            }
          </Button>
          
          {paymentStatus === 'pending' && (
            <p className="text-xs text-gray-500">
              {lygosPaymentUrl 
                ? "Cela ouvrira la plateforme de paiement Lygos dans un nouvel onglet"
                : "Chargement de l'URL de paiement..."
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentStatusContent;
