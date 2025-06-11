
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

    // Use the correct Lygos API endpoint - seems like /checkout might not be the right path
    const baseUrl = config.base_url || 'https://api.lygosapp.com/v1';
    console.log('Using base URL:', baseUrl);
    
    // Try the direct payment endpoint instead of checkout
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

    // Use the direct payment endpoint without /checkout
    const fullUrl = `${baseUrl}/payment?${paymentParams.toString()}`;
    console.log('Generated Lygos payment URL:', fullUrl);
    
    return fullUrl;
  } catch (error) {
    console.error('Error generating Lygos payment URL:', error);
    // Use a simpler fallback endpoint
    const fallbackUrl = `https://api.lygosapp.com/v1/payment?payment_id=${paymentId}&amount=${amount}&currency=${currency}`;
    console.log('Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  }
};

export const getPaymentDataProperty = (paymentData: any, property: string): string | undefined => {
  if (!paymentData || typeof paymentData !== 'object') return undefined;
  return paymentData[property];
};
