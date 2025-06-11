
import React from 'react';

interface PaymentTransaction {
  id: string;
  status: string;
  lygos_status?: string;
  amount: number;
  currency: string;
  lygos_payment_id?: string;
  payment_data?: any;
}

interface TimeRemaining {
  minutes: number;
  seconds: number;
  expired: boolean;
}

interface PaymentStatusInfoProps {
  transactionId: string | null;
  transaction: PaymentTransaction | null;
  timeRemaining: TimeRemaining | null;
  paymentStatus: string;
  trackingError: string | null;
  lygosPaymentUrl: string | null;
}

const PaymentStatusInfo: React.FC<PaymentStatusInfoProps> = ({
  transactionId,
  transaction,
  timeRemaining,
  paymentStatus,
  trackingError,
  lygosPaymentUrl
}) => {
  return (
    <>
      {transactionId && (
        <p className="text-sm text-gray-500 mb-4">
          Transaction ID: {transactionId}
        </p>
      )}

      {/* Show real transaction details */}
      {transaction && (
        <div className="bg-gray-50 border rounded-lg p-3 mb-4 text-sm">
          <p><strong>Statut réel:</strong> {transaction.status}</p>
          {transaction.lygos_status && (
            <p><strong>Statut Lygos:</strong> {transaction.lygos_status}</p>
          )}
          <p><strong>Montant:</strong> {transaction.amount} {transaction.currency}</p>
        </div>
      )}

      {/* Show time remaining for pending payments */}
      {paymentStatus === 'pending' && timeRemaining && !timeRemaining.expired && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-700">
            Temps restant: {timeRemaining.minutes}m {timeRemaining.seconds}s
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Le statut restera "pending" jusqu'à confirmation de Lygos
          </p>
        </div>
      )}

      {/* Show error if tracking failed */}
      {trackingError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">
            Erreur de suivi: {trackingError}
          </p>
        </div>
      )}

      {/* Enhanced debug information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs">
          <p><strong>Debug détaillé:</strong></p>
          <p>URL Lygos: {lygosPaymentUrl || 'Non disponible'}</p>
          <p>Payment Data: {transaction?.payment_data ? 'Disponible' : 'Manquant'}</p>
          {transaction?.payment_data && (
            <p>Payment Data Keys: {Object.keys(transaction.payment_data).join(', ')}</p>
          )}
          <p>Lygos Payment ID: {transaction?.lygos_payment_id || 'Non disponible'}</p>
        </div>
      )}
    </>
  );
};

export default PaymentStatusInfo;
