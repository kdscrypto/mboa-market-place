
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

    const baseUrl = config.base_url || 'https://payment.lygos.cm';
    console.log('Using base URL:', baseUrl);
    
    const paymentParams = new URLSearchParams({
      payment_id: paymentId,
      amount: amount.toString(),
      currency: currency,
      customer_name: customerData.name || '',
      customer_email: customerData.email || '',
      customer_phone: customerData.phone || '',
      return_url: config.return_url || `${window.location.origin}/payment-status`,
      cancel_url: config.cancel_url || `${window.location.origin}/publier-annonce`,
      api_key: config.api_key || ''
    });

    const fullUrl = `${baseUrl}/pay?${paymentParams.toString()}`;
    console.log('Generated Lygos payment URL:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('Error generating Lygos payment URL:', error);
    const fallbackUrl = `https://payment.lygos.cm/pay/${paymentId}?amount=${amount}&currency=${currency}`;
    console.log('Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  }
};

export const getPaymentDataProperty = (paymentData: any, property: string): string | undefined => {
  if (!paymentData || typeof paymentData !== 'object') return undefined;
  return paymentData[property];
};
