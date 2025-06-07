
export interface TransactionUpdateData {
  monetbil_transaction_id: string;
  updated_at: string;
  status?: string;
  completed_at?: string;
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
