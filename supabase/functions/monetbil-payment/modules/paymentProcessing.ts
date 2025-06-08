
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

function isValidMonetbilToken(token: string): boolean {
  // Un token Monetbil valide est généralement alphanumerique et ne contient pas de HTML
  const htmlPattern = /<[^>]*>/
  return !htmlPattern.test(token) && token.length > 10 && /^[a-zA-Z0-9_-]+$/.test(token)
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
  console.log('Preparing Monetbil API request with enhanced validation')
  
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

  console.log('Monetbil request data:', {
    service: serviceKey,
    amount: amount.toString(),
    currency: 'XAF',
    item_ref: transactionId,
    payment_ref: `MBOA_${transactionId}`
  })

  const formBody = new URLSearchParams()
  Object.entries(monetbilData).forEach(([key, value]) => {
    formBody.append(key, value)
  })

  console.log('Calling Monetbil API...')

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
    statusText: monetbilResponse.statusText,
    resultLength: monetbilResult.length,
    resultPreview: monetbilResult.substring(0, 100)
  })

  if (!monetbilResponse.ok) {
    console.error('Monetbil API HTTP error:', {
      status: monetbilResponse.status,
      statusText: monetbilResponse.statusText,
      response: monetbilResult
    })
    throw new Error(`Erreur de l'API Monetbil (${monetbilResponse.status}): ${monetbilResponse.statusText}`)
  }

  // Vérifier si la réponse est un token valide ou une erreur HTML
  if (!isValidMonetbilToken(monetbilResult)) {
    console.error('Invalid Monetbil response received:', monetbilResult)
    
    // Si c'est du HTML, extraire le message d'erreur
    if (monetbilResult.includes('<h1>')) {
      const errorMatch = monetbilResult.match(/<h1>(.*?)<\/h1>/)
      const errorMessage = errorMatch ? errorMatch[1] : 'Erreur inconnue de Monetbil'
      throw new Error(`Erreur Monetbil: ${errorMessage}`)
    }
    
    throw new Error('Réponse invalide de l\'API Monetbil. Veuillez vérifier vos clés API et réessayer.')
  }

  console.log('Valid Monetbil token received:', monetbilResult)
  return monetbilResult
}
