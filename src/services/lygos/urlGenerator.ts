
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

    // Try different possible base URLs for Lygos payment
    const possibleBaseUrls = [
      'https://api.lygos.cm',
      'https://checkout.lygos.cm', 
      'https://pay.lygos.cm',
      'https://lygos.cm',
      config.base_url
    ].filter(Boolean);

    // Use the configured base_url or fall back to api.lygos.cm
    const baseUrl = config.base_url || 'https://api.lygos.cm';
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

    // Try different endpoint structures
    const possibleEndpoints = [
      `${baseUrl}/payment/checkout?${paymentParams.toString()}`,
      `${baseUrl}/checkout?${paymentParams.toString()}`,
      `${baseUrl}/pay?${paymentParams.toString()}`,
      `${baseUrl}/api/payment?${paymentParams.toString()}`
    ];

    const fullUrl = possibleEndpoints[0]; // Use the first one as default
    console.log('Generated Lygos payment URL:', fullUrl);
    console.log('Alternative URLs to try if this fails:', possibleEndpoints.slice(1));
    
    return fullUrl;
  } catch (error) {
    console.error('Error generating Lygos payment URL:', error);
    // Use a more conservative fallback - just the payment ID
    const fallbackUrl = `https://api.lygos.cm/payment/${paymentId}`;
    console.log('Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  }
};

export const getPaymentDataProperty = (paymentData: any, property: string): string | undefined => {
  if (!paymentData || typeof paymentData !== 'object') return undefined;
  return paymentData[property];
};
