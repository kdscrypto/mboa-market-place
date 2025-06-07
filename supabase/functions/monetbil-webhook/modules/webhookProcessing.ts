
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

  // Create the ad from stored data
  const adData = transaction.payment_data.adData;
  const adType = transaction.payment_data.adType;

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
    return { success: false, error: adError.message };
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
  const { error: updateError } = await supabase
    .from('payment_transactions')
    .update(updateData)
    .eq('id', transactionId);

  if (updateError) {
    console.error('Error updating transaction:', updateError);
    return { success: false, error: updateError.message };
  }

  return { success: true };
}

export function createTransactionUpdateData(
  status: string,
  monetbilTransactionId: string,
  isSuccessful: boolean = false
): TransactionUpdateData {
  const updateData: TransactionUpdateData = {
    monetbil_transaction_id: monetbilTransactionId,
    updated_at: new Date().toISOString()
  };

  if (status === '1' && isSuccessful) {
    // Payment successful
    updateData.status = 'completed';
    updateData.completed_at = new Date().toISOString();
  } else {
    // Payment failed or cancelled
    updateData.status = 'failed';
  }

  return updateData;
}
