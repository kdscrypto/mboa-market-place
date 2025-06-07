
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
  'premium_24h': 1000,
  'premium_7d': 5000,
  'premium_15d': 10000,
  'premium_30d': 15000,
}

export function validatePaymentAmount(adType: string): number {
  const amount = PLAN_PRICES[adType]
  if (amount === undefined) {
    throw new Error(`Invalid ad type: ${adType}`)
  }
  return amount
}

export async function processStandardAd(supabase: any, adData: AdData, adType: string, userId: string): Promise<string> {
  console.log('Processing free standard ad...')
  
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

export async function callMonetbilAPI(
  serviceKey: string,
  serviceSecret: string,
  amount: number,
  adData: AdData,
  transactionId: string,
  userId: string,
  userEmail: string,
  returnUrl: string,
  cancelUrl: string,
  notifyUrl: string
): Promise<string> {
  const monetbilData = {
    service: serviceKey,
    amount: amount.toString(),
    phone: adData.phone,
    locale: 'fr',
    currency: 'XAF',
    return: returnUrl,
    cancel: cancelUrl,
    notify: notifyUrl,
    item_ref: transactionId,
    payment_ref: `MBOA_${transactionId}`,
    user: userId,
    first_name: 'Utilisateur',
    last_name: 'MBOA',
    email: userEmail || `${userId}@mboa.cm`
  }

  console.log('Sending request to Monetbil with enhanced security logging')

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
  console.log('Monetbil API response status:', monetbilResponse.status)

  if (!monetbilResponse.ok) {
    console.error('Monetbil API error:', monetbilResult)
    throw new Error(`Monetbil API error: ${monetbilResponse.status}`)
  }

  return monetbilResult
}
