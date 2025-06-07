
export interface TransactionData {
  user_id: string
  amount: number
  currency: string
  status: string
  return_url: string
  cancel_url: string
  notify_url: string
  payment_data: any
  client_fingerprint: string
  security_score: number
}

export async function createPaymentTransaction(
  supabase: any,
  transactionData: TransactionData
): Promise<{ id: string; expires_at: string }> {
  console.log('Creating secure payment transaction for premium ad...')

  const { data: transaction, error: transactionError } = await supabase
    .from('payment_transactions')
    .insert(transactionData)
    .select('id, expires_at')
    .single()

  if (transactionError) {
    console.error('Error creating payment transaction:', transactionError)
    throw new Error('Failed to create payment transaction: ' + transactionError.message)
  }

  console.log('Payment transaction created with enhanced security:', {
    id: transaction.id,
    expires_at: transaction.expires_at,
    security_score: transactionData.security_score,
    client_fingerprint: transactionData.client_fingerprint
  })

  return transaction
}

export async function updateTransactionWithMonetbilResponse(
  supabase: any,
  transactionId: string,
  monetbilToken: string
): Promise<void> {
  await supabase
    .from('payment_transactions')
    .update({
      monetbil_payment_token: monetbilToken,
      payment_url: `https://api.monetbil.com/widget/v2.1/${monetbilToken}`
    })
    .eq('id', transactionId)
}

export function generatePaymentUrls(req: Request): { returnUrl: string; cancelUrl: string; notifyUrl: string } {
  const origin = req.headers.get('origin')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  
  return {
    returnUrl: `${origin}/payment-return`,
    cancelUrl: `${origin}/publier-annonce`,
    notifyUrl: `${supabaseUrl}/functions/v1/monetbil-webhook`
  }
}
