
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    const status = formData.get('status')
    const transactionId = formData.get('item_ref')
    const monetbilTransactionId = formData.get('transaction_id')

    console.log('Webhook received:', { status, transactionId, monetbilTransactionId })

    if (!transactionId) {
      return new Response('Missing transaction ID', { status: 400 })
    }

    // Get the payment transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transactionId)
      .single()

    if (transactionError || !transaction) {
      console.error('Transaction not found:', transactionError)
      return new Response('Transaction not found', { status: 404 })
    }

    // Update transaction status
    const updateData: any = {
      monetbil_transaction_id: monetbilTransactionId,
      updated_at: new Date().toISOString()
    }

    if (status === '1') {
      // Payment successful
      updateData.status = 'completed'
      updateData.completed_at = new Date().toISOString()

      console.log('Payment successful, creating ad...')

      // Create the ad from stored data
      const adData = transaction.payment_data.adData
      const adType = transaction.payment_data.adType

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
        .single()

      if (adError) {
        console.error('Error creating ad:', adError)
        updateData.status = 'failed'
      } else {
        console.log('Ad created successfully:', ad.id)
        
        // Handle images if present
        if (adData.images && adData.images.length > 0) {
          console.log('Note: Images will need to be handled separately')
        }
      }
    } else {
      // Payment failed
      updateData.status = 'failed'
    }

    // Update the transaction
    await supabase
      .from('payment_transactions')
      .update(updateData)
      .eq('id', transactionId)

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
