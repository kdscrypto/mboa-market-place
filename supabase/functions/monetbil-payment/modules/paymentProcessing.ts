
export interface AdData {
  title: string
  description: string
  category: string
  price: number
  region: string
  city: string
  phone: string
  whatsapp?: string
}

export interface PaymentRequest {
  adData: AdData
  adType: string
}

export const PLAN_PRICES: Record<string, number> = {
  'standard': 0,
  // All plans are now free
  'premium_24h': 0,
  'premium_7d': 0,
  'premium_15d': 0,
  'premium_30d': 0,
}

export function validatePaymentAmount(adType: string): number {
  const amount = PLAN_PRICES[adType]
  if (amount === undefined) {
    throw new Error(`Invalid ad type: ${adType}`)
  }
  return amount
}

export async function processStandardAd(supabase: any, adData: AdData, adType: string, userId: string): Promise<string> {
  console.log('Processing free ad (all ads are now free)...')
  
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
      user_id: userId
    })
    .select('id')
    .single()

  if (adError) {
    console.error('Error creating ad:', adError)
    throw new Error('Failed to create ad')
  }

  return ad.id
}

// Monetbil functions removed - no longer needed since all ads are free
