
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { verifyLygosPayment, updateLygosTransactionStatus } from '@/services/lygosService';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface PaymentStatusTrackerProps {
  transactionId: string;
  onStatusChange?: (status: string) => void;
  autoRefresh?: boolean;
  showActions?: boolean;
}

const PaymentStatusTracker: React.FC<PaymentStatusTrackerProps> = ({
  transactionId,
  onStatusChange,
  autoRefresh = true,
  showActions = true
}) => {
  const [status, setStatus] = useState<string>('pending');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [paymentData, setPaymentData] = useState<any>(null);
  const { toast } = useToast();

  const fetchPaymentStatus = async () => {
    setIsRefreshing(true);
    
    try {
      // Get transaction from database
      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error || !transaction) {
        throw new Error('Transaction introuvable');
      }

      let currentStatus = transaction.status;
      
      // If pending and has Lygos payment ID, verify with Lygos
      if (currentStatus === 'pending' && transaction.lygos_payment_id && transaction.payment_provider === 'lygos') {
        try {
          const verification = await verifyLygosPayment(transaction.lygos_payment_id);
          
          if (verification.success && verification.paymentData) {
            const lygosStatus = verification.paymentData.status?.toLowerCase();
            
            // Update transaction status if different
            if (lygosStatus !== transaction.lygos_status) {
              const updateSuccess = await updateLygosTransactionStatus(
                transaction.lygos_payment_id,
                lygosStatus,
                verification.paymentData
              );

              if (updateSuccess) {
                // Map Lygos status to our internal status
                if (lygosStatus === 'completed' || lygosStatus === 'success' || lygosStatus === 'paid') {
                  currentStatus = 'completed';
                } else if (lygosStatus === 'failed' || lygosStatus === 'cancelled') {
                  currentStatus = 'failed';
                } else if (lygosStatus === 'expired') {
                  currentStatus = 'expired';
                }
              }
            }
            
            setPaymentData(verification.paymentData);
          }
        } catch (verifyError) {
          console.error('Verification error:', verifyError);
          // Don't throw, just log - transaction might still be processing
        }
      }

      setStatus(currentStatus);
      setLastChecked(new Date());
      
      if (onStatusChange && currentStatus !== status) {
        onStatusChange(currentStatus);
      }
      
    } catch (error) {
      console.error('Error fetching payment status:', error);
      toast({
        title: "Erreur de vérification",
        description: "Impossible de vérifier le statut du paiement",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
    
    if (autoRefresh && status === 'pending') {
      const interval = setInterval(fetchPaymentStatus, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [transactionId, status, autoRefresh]);

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = () => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      expired: 'secondary',
      pending: 'outline'
    } as const;

    const labels = {
      completed: 'Complété',
      failed: 'Échec',
      expired: 'Expiré',
      pending: 'En attente'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {getStatusIcon()}
        <span className="ml-1">{labels[status as keyof typeof labels] || status}</span>
      </Badge>
    );
  };

  return (
    <div className="flex items-center space-x-3">
      {getStatusBadge()}
      
      {showActions && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPaymentStatus}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <span className="text-xs text-gray-500">
            Vérifié: {lastChecked.toLocaleTimeString()}
          </span>
        </>
      )}
    </div>
  );
};

export default PaymentStatusTracker;
