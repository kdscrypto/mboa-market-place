
export interface TransactionUpdateData {
  monetbil_transaction_id: string;
  updated_at: string;
  status?: string;
  completed_at?: string;
}

export async function validateTransactionExists(
  supabase: any,
  transactionId: string
): Promise<{ valid: boolean; transaction: any; isExpired: boolean }> {
  const { data: transaction, error: transactionError } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (transactionError || !transaction) {
    console.error('Transaction not found:', transactionError);
    return { valid: false, transaction: null, isExpired: false };
  }

  // Check if transaction has expired
  const now = new Date();
  const expiresAt = new Date(transaction.expires_at);
  const isExpired = now > expiresAt;

  if (isExpired) {
    console.log('Transaction has expired, marking as expired');
    
    await supabase
      .from('payment_transactions')
      .update({ 
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);
  }

  return { valid: true, transaction, isExpired };
}

export async function processSuccessfulPayment(
  supabase: any,
  transaction: any,
  monetbilTransactionId: string
): Promise<{ success: boolean; adId?: string; error?: string }> {
  console.log('Payment successful, creating ad...');

  // Validate transaction amount against expected limits
  if (transaction.amount <= 0 || transaction.amount > 1000000) {
    return { 
      success: false, 
      error: `Invalid transaction amount: ${transaction.amount}` 
    };
  }

  // Create the ad from stored data
  const adData = transaction.payment_data.adData;
  const adType = transaction.payment_data.adType;

  // Validate ad data integrity
  if (!adData || !adData.title || !adData.description) {
    return { 
      success: false, 
      error: 'Invalid ad data in transaction' 
    };
  }

  const { data: ad, error: adError } = await supabase
    .from('ads')
    .insert({
      title: adData.title,
      description: adData.description,
      category: adData.category,
      price: adData.price,
      region: adData.region,
      city: adData.city,
      phone: adData.phone,
      whatsapp: adData.whatsapp || null,
      status: "pending",
      ad_type: adType,
      user_id: transaction.user_id,
      payment_transaction_id: transaction.id
    })
    .select('id')
    .single();

  if (adError) {
    console.error('Error creating ad:', adError);
    return { success: false, error: `Database error: ${adError.message}` };
  }

  console.log('Ad created successfully:', ad.id);
  
  // Handle images if present
  if (adData.images && adData.images.length > 0) {
    console.log('Note: Images will need to be handled separately');
  }

  return { success: true, adId: ad.id };
}

export async function updateTransactionStatus(
  supabase: any,
  transactionId: string,
  updateData: TransactionUpdateData
): Promise<{ success: boolean; error?: string }> {
  
  // Validate update data
  if (!updateData.monetbil_transaction_id) {
    return { success: false, error: 'Missing Monetbil transaction ID' };
  }

  const { error: updateError } = await supabase
    .from('payment_transactions')
    .update(updateData)
    .eq('id', transactionId);

  if (updateError) {
    console.error('Error updating transaction:', updateError);
    return { success: false, error: `Database update failed: ${updateError.message}` };
  }

  return { success: true };
}

export function createTransactionUpdateData(
  status: string,
  monetbilTransactionId: string
): TransactionUpdateData {
  if (!monetbilTransactionId) {
    throw new Error('Monetbil transaction ID is required');
  }

  const updateData: TransactionUpdateData = {
    monetbil_transaction_id: monetbilTransactionId,
    updated_at: new Date().toISOString()
  };

  // Map Monetbil status codes to our internal status
  switch (status) {
    case '1':
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
      break;
    case '0':
      updateData.status = 'pending';
      break;
    case '2':
    case '3':
    default:
      updateData.status = 'failed';
      break;
  }

  return updateData;
}

export async function validateTransactionSecurity(
  supabase: any,
  transaction: any,
  webhookData: any
): Promise<{ valid: boolean; error?: string }> {
  
  // Check if transaction is already completed to prevent replay attacks
  if (transaction.status === 'completed') {
    return { 
      valid: false, 
      error: 'Transaction already completed - potential replay attack' 
    };
  }

  // Validate transaction hasn't been processed multiple times
  const { data: auditLogs } = await supabase
    .from('payment_audit_logs')
    .select('id')
    .eq('transaction_id', transaction.id)
    .eq('event_type', 'webhook_processed')
    .limit(1);

  if (auditLogs && auditLogs.length > 0) {
    return { 
      valid: false, 
      error: 'Transaction already processed - duplicate webhook' 
    };
  }

  // Validate Monetbil transaction ID format if provided
  if (webhookData.monetbilTransactionId) {
    // Basic validation - Monetbil transaction IDs should be numeric
    if (!/^\d+$/.test(webhookData.monetbilTransactionId)) {
      return { 
        valid: false, 
        error: 'Invalid Monetbil transaction ID format' 
      };
    }
  }

  return { valid: true };
}
