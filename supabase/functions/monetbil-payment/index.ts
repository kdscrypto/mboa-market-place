
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

    // Get authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { adData, adType } = await req.json()
    console.log('Payment request received:', { userId: user.id, adType, adData: adData.title })

    // Get plan pricing
    const planPrices: Record<string, number> = {
      'standard': 0,
      'premium_24h': 1000,
      'premium_7d': 5000,
      'premium_15d': 10000,
      'premium_30d': 15000,
    }

    const amount = planPrices[adType] || 0

    // For standard ads (free), process directly
    if (amount === 0) {
      console.log('Processing free standard ad...')
      
      // Create the ad directly
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
          user_id: user.id
        })
        .select('id')
        .single()

      if (adError) {
        console.error('Error creating ad:', adError)
        throw new Error('Failed to create ad')
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          adId: ad.id, 
          paymentRequired: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For premium ads, create payment transaction
    console.log('Creating payment transaction for premium ad...')
    
    const returnUrl = `${req.headers.get('origin')}/payment-return`
    const cancelUrl = `${req.headers.get('origin')}/publier-annonce`
    const notifyUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/monetbil-webhook`

    // Create payment transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        amount,
        currency: 'XAF',
        status: 'pending',
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: notifyUrl,
        payment_data: { adData, adType }
      })
      .select('id')
      .single()

    if (transactionError) {
      console.error('Error creating payment transaction:', transactionError)
      throw new Error('Failed to create payment transaction')
    }

    // Get Monetbil API credentials
    const serviceKey = Deno.env.get('MONETBIL_SERVICE_KEY')
    const serviceSecret = Deno.env.get('MONETBIL_SERVICE_SECRET')

    if (!serviceKey || !serviceSecret) {
      console.error('Monetbil API credentials not configured')
      throw new Error('Payment service not properly configured')
    }

    // Prepare Monetbil payment request using the official API
    const monetbilData = {
      service: serviceKey,
      amount: amount.toString(),
      phone: adData.phone,
      locale: 'fr',
      currency: 'XAF',
      return: returnUrl,
      cancel: cancelUrl,
      notify: notifyUrl,
      item_ref: transaction.id,
      payment_ref: `MBOA_${transaction.id}`,
      user: user.id,
      first_name: 'Utilisateur',
      last_name: 'MBOA',
      email: user.email || `${user.id}@mboa.cm`
    }

    console.log('Sending request to Monetbil with credentials:', { 
      serviceKey: serviceKey.substring(0, 8) + '...', 
      amount: monetbilData.amount,
      phone: monetbilData.phone 
    })

    // Call Monetbil API with authentication
    const formBody = new URLSearchParams()
    Object.entries(monetbilData).forEach(([key, value]) => {
      formBody.append(key, value)
    })

    const monetbilResponse = await fetch('https://api.monetbil.com/widget/v2.1/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Service-Secret': serviceSecret,
      },
      body: formBody.toString()
    })

    const monetbilResult = await monetbilResponse.text()
    console.log('Monetbil API response:', { 
      status: monetbilResponse.status, 
      result: monetbilResult.substring(0, 100) + '...' 
    })

    if (!monetbilResponse.ok) {
      console.error('Monetbil API error:', monetbilResult)
      throw new Error(`Monetbil API error: ${monetbilResponse.status}`)
    }

    // Update transaction with Monetbil response
    await supabase
      .from('payment_transactions')
      .update({
        monetbil_payment_token: monetbilResult,
        payment_url: `https://api.monetbil.com/widget/v2.1/${monetbilResult}`
      })
      .eq('id', transaction.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentRequired: true,
        paymentUrl: `https://api.monetbil.com/widget/v2.1/${monetbilResult}`,
        transactionId: transaction.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Payment processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
