
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
