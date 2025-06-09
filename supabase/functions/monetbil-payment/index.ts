
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== FREE AD CREATION FUNCTION ===')
  console.log('All ads are now free - no payment required')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Token d\'authentification manquant')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.error('Authentication error:', error)
      throw new Error('Token d\'authentification invalide')
    }

    const { adData, adType } = await req.json()
    console.log('Creating free ad:', { 
      userId: user.id, 
      adType, 
      adTitle: adData.title,
      adPrice: adData.price
    })

    // All ads are now free - create directly
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
        ad_type: 'standard', // All ads are now standard
        user_id: user.id
      })
      .select('id')
      .single()

    if (adError) {
      console.error('Error creating ad:', adError)
      throw new Error('Failed to create ad')
    }

    console.log('Free ad created successfully:', ad.id)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentRequired: false,
        adId: ad.id,
        message: 'Annonce gratuite créée avec succès - aucun paiement requis',
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('=== AD CREATION ERROR ===')
    console.error('Error details:', error.message)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur lors de la création de l\'annonce',
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
