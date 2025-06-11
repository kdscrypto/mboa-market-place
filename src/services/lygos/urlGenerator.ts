
import { getLygosConfig } from '../lygosConfigService';

// DEPRECATED: This URL generator is no longer used.
// We now use the real Lygos API to create payments and get checkout URLs.
// See: src/services/lygos/paymentInitiator.ts and supabase/functions/lygos-payment-create/

export const generateLygosPaymentUrl = async (
  paymentId: string, 
  amount: number, 
  currency: string, 
  customerData: any
): Promise<string> => {
  console.warn('DEPRECATED: generateLygosPaymentUrl is deprecated. Use createLygosPayment instead.');
  
  try {
    const config = await getLygosConfig();
    
    if (!config) {
      throw new Error('Configuration Lygos manquante');
    }

    // Fallback URL for backward compatibility
    const fallbackUrl = `https://checkout.lygosapp.com/${paymentId}`;
    console.log('Using fallback checkout URL:', fallbackUrl);
    return fallbackUrl;
  } catch (error) {
    console.error('Error generating fallback Lygos URL:', error);
    throw error;
  }
};

export const getPaymentDataProperty = (paymentData: any, property: string): string | undefined => {
  if (!paymentData || typeof paymentData !== 'object') return undefined;
  return paymentData[property];
};
