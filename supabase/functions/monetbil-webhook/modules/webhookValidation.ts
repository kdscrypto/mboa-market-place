
export interface WebhookFormData {
  status: string | null;
  transactionId: string | null;
  monetbilTransactionId: string | null;
  signature: string | null;
}

export async function parseWebhookFormData(req: Request): Promise<WebhookFormData> {
  const formData = await req.formData();
  
  return {
    status: formData.get('status') as string | null,
    transactionId: formData.get('item_ref') as string | null,
    monetbilTransactionId: formData.get('transaction_id') as string | null,
    signature: formData.get('signature') as string | null
  };
}

export async function validateWebhookSignature(
  formData: FormData,
  providedSignature: string,
  serviceSecret: string
): Promise<boolean> {
  try {
    const expectedSignature = await generateWebhookSignature(formData, serviceSecret);
    return providedSignature === expectedSignature;
  } catch (error) {
    console.error('Error validating signature:', error);
    return false;
  }
}

export async function generateWebhookSignature(formData: FormData, secret: string): Promise<string> {
  try {
    // Create a string from form data for signature generation
    const sortedParams = Array.from(formData.entries())
      .filter(([key]) => key !== 'signature')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const dataToSign = sortedParams + secret;
    
    // Generate SHA256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Error generating signature:', error);
    return '';
  }
}

export function validateRequiredFields(webhookData: WebhookFormData): string | null {
  if (!webhookData.transactionId) {
    return 'Missing transaction ID in webhook';
  }
  
  return null;
}
