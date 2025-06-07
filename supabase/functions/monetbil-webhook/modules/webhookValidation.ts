
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
    
    // Use constant-time comparison to prevent timing attacks
    if (providedSignature.length !== expectedSignature.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < providedSignature.length; i++) {
      result |= providedSignature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    
    return result === 0;
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
    throw new Error('Failed to generate signature');
  }
}

export function validateRequiredFields(webhookData: WebhookFormData): string | null {
  if (!webhookData.transactionId) {
    return 'Missing transaction ID in webhook';
  }
  
  if (!webhookData.status) {
    return 'Missing status in webhook';
  }
  
  // Validate status is one of expected values
  const validStatuses = ['0', '1', '2', '3']; // 0=pending, 1=success, 2=failed, 3=cancelled
  if (!validStatuses.includes(webhookData.status)) {
    return `Invalid status value: ${webhookData.status}`;
  }
  
  return null;
}

export function validateWebhookSecurity(webhookData: WebhookFormData, hasSignature: boolean): string | null {
  // Signature is now mandatory for security
  if (!hasSignature) {
    return 'Webhook signature is required for security';
  }
  
  // Validate transaction ID format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(webhookData.transactionId || '')) {
    return 'Invalid transaction ID format';
  }
  
  return null;
}
