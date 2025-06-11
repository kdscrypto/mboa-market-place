
import { getLygosConfig } from '../lygosConfigService';

export const generateLygosPaymentUrl = async (
  paymentId: string, 
  amount: number, 
  currency: string, 
  customerData: any
): Promise<string> => {
  try {
    console.log('Generating Lygos payment URL with params:', { paymentId, amount, currency, customerData });
    
    const config = await getLygosConfig();
    console.log('Lygos config retrieved:', config ? 'Config found' : 'No config found');
    
    if (!config) {
      console.error('No Lygos configuration found');
      throw new Error('Configuration Lygos manquante');
    }

    // Use the correct Lygos API endpoint provided by support
    const baseUrl = config.base_url || 'https://api.lygosapp.com/v1';
    console.log('Using base URL:', baseUrl);
    
    // Create payment URL with proper Lygos API endpoint structure
    const paymentParams = new URLSearchParams({
      payment_id: paymentId,
      amount: amount.toString(),
      currency: currency,
      customer_name: customerData.name || '',
      customer_email: customerData.email || '',
      customer_phone: customerData.phone || '',
      return_url: config.return_url || `${window.location.origin}/payment-return`,
      cancel_url: config.cancel_url || `${window.location.origin}/publier-annonce`
    });

    // Use the correct Lygos endpoint structure
    const fullUrl = `${baseUrl}/payment/checkout?${paymentParams.toString()}`;
    console.log('Generated Lygos payment URL:', fullUrl);
    
    return fullUrl;
  } catch (error) {
    console.error('Error generating Lygos payment URL:', error);
    // Use the correct fallback endpoint
    const fallbackUrl = `https://api.lygosapp.com/v1/payment/${paymentId}`;
    console.log('Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  }
};

export const getPaymentDataProperty = (paymentData: any, property: string): string | undefined => {
  if (!paymentData || typeof paymentData !== 'object') return undefined;
  return paymentData[property];
};
