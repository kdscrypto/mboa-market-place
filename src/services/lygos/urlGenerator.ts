
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

    // Use payment.lygos.cm as the base URL for the payment page
    const baseUrl = 'https://payment.lygos.cm';
    console.log('Using base URL:', baseUrl);
    
    // Create a simplified payment URL without exposing API key in URL
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

    const fullUrl = `${baseUrl}/pay?${paymentParams.toString()}`;
    console.log('Generated Lygos payment URL:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('Error generating Lygos payment URL:', error);
    // Use a more reliable fallback URL structure
    const fallbackUrl = `https://payment.lygos.cm/pay/${paymentId}`;
    console.log('Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  }
};

export const getPaymentDataProperty = (paymentData: any, property: string): string | undefined => {
  if (!paymentData || typeof paymentData !== 'object') return undefined;
  return paymentData[property];
};
