
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  
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
  const [lygosPaymentUrl, setLygosPaymentUrl] = useState<string | null>(null);

  // Update time remaining every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [getTimeRemaining]);

  // Get Lygos payment URL when transaction changes
  useEffect(() => {
    const fetchLygosUrl = async () => {
      if (transaction) {
        const url = await getLygosPaymentUrl(transaction);
        setLygosPaymentUrl(url);
      }
    };
    
    fetchLygosUrl();
  }, [transaction, getLygosPaymentUrl]);

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

  const handleRetry = () => {
    // Refresh the page to restart the payment process
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate('/publier-annonce');
  };

  const handleContactSupport = () => {
    toast({
      title: "Support",
      description: "Veuillez contacter notre équipe support à support@mboa-market.com",
    });
  };

  // Extract error information
  const getErrorInfo = () => {
    if (trackingError) {
      return {
        error: trackingError,
        errorCode: 'tracking_error'
      };
    }
    
    if (transaction?.payment_data?.error) {
      return {
        error: transaction.payment_data.error,
        errorCode: transaction.payment_data.error_code
      };
    }
    
    return {};
  };

  const { error, errorCode } = getErrorInfo();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-mboa-gray py-12">
        <div className="w-full max-w-4xl mx-auto px-4">
          <PaymentStatusContent
            paymentStatus={paymentStatus}
            onPaymentAction={handlePaymentActionWrapper}
            lygosPaymentUrl={lygosPaymentUrl}
            transaction={transaction}
            error={error}
            errorCode={errorCode}
            onRetry={handleRetry}
            onGoBack={handleGoBack}
            onContactSupport={handleContactSupport}
          />
          
          <div className="mt-6">
            <PaymentStatusInfo
              transactionId={transactionId}
              transaction={transaction}
              timeRemaining={timeRemaining}
              paymentStatus={paymentStatus}
              trackingError={trackingError}
              lygosPaymentUrl={lygosPaymentUrl}
            />
          </div>
          
          <div className="flex justify-center mt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="px-8"
            >
              Retourner à l'accueil
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentStatus;
