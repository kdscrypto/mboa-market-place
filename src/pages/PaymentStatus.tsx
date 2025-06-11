
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { usePaymentTracking } from "@/hooks/usePaymentTracking";
import PaymentStatusContent from "@/components/payment/PaymentStatusContent";
import PaymentStatusInfo from "@/components/payment/PaymentStatusInfo";
import { usePaymentStatusHandlers } from "@/hooks/payment/usePaymentStatusHandlers";
import { usePaymentStatusEffects } from "@/hooks/payment/usePaymentStatusEffects";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const transactionId = searchParams.get('transaction');
  const paymentId = searchParams.get('payment_id');
  
  // Use the payment tracking hook for real payment status
  const { 
    transaction, 
    isLoading: isTrackingLoading, 
    error: trackingError,
    getTimeRemaining,
    isExpired
  } = usePaymentTracking(transactionId || undefined);

  const { getLygosPaymentUrl, handlePaymentAction } = usePaymentStatusHandlers();
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining());

  // Update time remaining every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [getTimeRemaining]);

  // Determine payment status based on REAL transaction data - NO SIMULATION
  const getPaymentStatus = () => {
    if (!transaction) return 'loading';
    
    // Check if payment has expired
    if (isExpired()) return 'expired';
    
    // Use REAL status from database - no random simulation
    switch (transaction.status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'failed';
      case 'expired':
        return 'expired';
      case 'pending':
      default:
        // IMPORTANT: Stay pending until REAL confirmation
        return 'pending';
    }
  };

  const paymentStatus = getPaymentStatus();
  const lygosPaymentUrl = getLygosPaymentUrl(transaction);

  // Use payment status effects
  usePaymentStatusEffects(paymentStatus, transaction);

  // Debug information in development
  useEffect(() => {
    console.log('=== PaymentStatus Debug Info ===', {
      transactionId,
      paymentId,
      transaction,
      paymentStatus,
      lygosPaymentUrl,
      trackingError,
      payment_data_keys: transaction?.payment_data ? Object.keys(transaction.payment_data) : 'No payment_data'
    });
  }, [transactionId, paymentId, transaction, paymentStatus, lygosPaymentUrl, trackingError]);

  const handlePaymentActionWrapper = () => {
    handlePaymentAction(paymentStatus, transaction);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-mboa-gray py-12">
        <div className="w-full max-w-md mx-auto">
          <PaymentStatusContent
            paymentStatus={paymentStatus}
            onPaymentAction={handlePaymentActionWrapper}
            lygosPaymentUrl={lygosPaymentUrl}
          />
          
          <div className="mt-4">
            <PaymentStatusInfo
              transactionId={transactionId}
              transaction={transaction}
              timeRemaining={timeRemaining}
              paymentStatus={paymentStatus}
              trackingError={trackingError}
              lygosPaymentUrl={lygosPaymentUrl}
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-full mt-4"
          >
            Retourner à l'accueil
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentStatus;
