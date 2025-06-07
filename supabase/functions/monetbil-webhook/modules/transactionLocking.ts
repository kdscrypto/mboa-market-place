
export interface LockResult {
  acquired: boolean;
  lockIdentifier: string | null;
}

export async function acquireTransactionLock(
  supabase: any,
  transactionId: string
): Promise<LockResult> {
  // Generate unique lock identifier for this webhook processing
  const lockIdentifier = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Try to acquire processing lock
  const { data: lockResult, error: lockError } = await supabase
    .rpc('acquire_transaction_lock', {
      transaction_uuid: transactionId,
      lock_identifier: lockIdentifier
    });

  if (lockError) {
    console.error('Error acquiring transaction lock:', lockError);
    return { acquired: false, lockIdentifier: null };
  }

  if (!lockResult) {
    console.log('Transaction already being processed or expired');
    return { acquired: false, lockIdentifier: null };
  }

  console.log('Successfully acquired transaction lock:', lockIdentifier);
  return { acquired: true, lockIdentifier };
}

export async function releaseTransactionLock(
  supabase: any,
  transactionId: string,
  lockIdentifier: string
): Promise<void> {
  try {
    const { error: unlockError } = await supabase
      .rpc('release_transaction_lock', {
        transaction_uuid: transactionId,
        lock_identifier: lockIdentifier
      });
    
    if (unlockError) {
      console.error('Error releasing transaction lock:', unlockError);
    } else {
      console.log('Successfully released transaction lock:', lockIdentifier);
    }
  } catch (unlockError) {
    console.error('Failed to release lock:', unlockError);
  }
}
