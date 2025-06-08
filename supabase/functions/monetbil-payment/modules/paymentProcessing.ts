
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

function validateMonetbilCredentials(serviceKey: string, serviceSecret: string): void {
  if (!serviceKey || serviceKey.length < 8) {
    throw new Error('Clé de service Monetbil invalide ou manquante')
  }
  
  if (!serviceSecret || serviceSecret.length < 8) {
    throw new Error('Secret de service Monetbil invalide ou manquant')
  }
}

function isValidMonetbilToken(token: string): boolean {
  // Un token Monetbil valide est généralement alphanumerique et ne contient pas de HTML
  const htmlPattern = /<[^>]*>/
  return !htmlPattern.test(token) && token.length > 5 && /^[a-zA-Z0-9_-]+$/.test(token)
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
  console.log('=== MONETBIL API CALL DEBUG ===')
  console.log('Starting Monetbil API call with enhanced validation...')
  
  // Validate credentials first
  try {
    validateMonetbilCredentials(serviceKey, serviceSecret)
    console.log('✓ Monetbil credentials validated')
  } catch (error) {
    console.error('✗ Monetbil credentials validation failed:', error.message)
    throw new Error('Configuration Monetbil invalide. Veuillez vérifier vos clés API.')
  }
  
  // Validate amount
  if (amount <= 0 || amount > 1000000) {
    throw new Error('Montant de paiement invalide')
  }
  console.log('✓ Amount validated:', amount)
  
  // Prepare phone number (ensure it's valid for Cameroon)
  let phoneNumber = adData.phone.replace(/\s+/g, '') // Remove spaces
  if (phoneNumber.startsWith('0')) {
    phoneNumber = '237' + phoneNumber.substring(1)
  } else if (!phoneNumber.startsWith('237')) {
    phoneNumber = '237' + phoneNumber
  }
  console.log('✓ Phone number formatted:', phoneNumber)
  
  // Construct the Monetbil request data according to their API spec
  const monetbilData = {
    service: serviceKey,
    amount: amount.toString(),
    phone: phoneNumber,
    locale: 'fr',
    currency: 'XAF',
    return: returnUrl,
    cancel: cancelUrl,
    notify: notifyUrl,
    item_ref: transactionId,
    payment_ref: `MBOA_${transactionId.substring(0, 8)}`,
    user: userId.substring(0, 8), // Shorten user ID
    first_name: 'Utilisateur',
    last_name: 'MBOA',
    email: userEmail || `${userId.substring(0, 8)}@mboa.cm`
  }

  console.log('Monetbil request payload:', {
    service: serviceKey.substring(0, 8) + '...',
    amount: amount.toString(),
    phone: phoneNumber,
    currency: 'XAF',
    item_ref: transactionId,
    payment_ref: `MBOA_${transactionId.substring(0, 8)}`,
    return: returnUrl,
    cancel: cancelUrl,
    notify: notifyUrl
  })

  // Build form data properly
  const formBody = new URLSearchParams()
  Object.entries(monetbilData).forEach(([key, value]) => {
    formBody.append(key, value)
  })

  console.log('Form data string:', formBody.toString().substring(0, 200) + '...')

  // Try multiple Monetbil endpoints if the first one fails
  const endpoints = [
    'https://api.monetbil.com/widget/v2.1/',
    'https://api.monetbil.com/v1/widget',
    'https://monetbil.com/api/v1/widget'
  ]

  let lastError: Error | null = null

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`)

      const monetbilResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Service-Secret': serviceSecret,
          'User-Agent': 'MBOA-Market/1.0',
          'Accept': 'text/plain, application/json, */*'
        },
        body: formBody.toString()
      })

      const monetbilResult = await monetbilResponse.text()
      
      console.log(`Response from ${endpoint}:`, {
        status: monetbilResponse.status,
        statusText: monetbilResponse.statusText,
        resultLength: monetbilResult.length,
        resultPreview: monetbilResult.substring(0, 100),
        headers: Object.fromEntries(monetbilResponse.headers.entries())
      })

      // Check if this endpoint worked
      if (monetbilResponse.ok && !monetbilResult.includes('<h1>') && !monetbilResult.includes('<!DOCTYPE')) {
        // Validate if we received a proper token
        if (isValidMonetbilToken(monetbilResult.trim())) {
          console.log('✓ Valid Monetbil token received from:', endpoint)
          return monetbilResult.trim()
        } else {
          console.log('✗ Invalid token format from:', endpoint)
          continue
        }
      }

      // If we get here, this endpoint didn't work
      lastError = new Error(`Endpoint ${endpoint} returned: ${monetbilResult.substring(0, 100)}`)
      
    } catch (error) {
      console.error(`Error with endpoint ${endpoint}:`, error)
      lastError = error instanceof Error ? error : new Error(String(error))
      continue
    }
  }

  // If all endpoints failed
  console.error('All Monetbil endpoints failed. Last error:', lastError?.message)
  
  // Check if it's a network issue
  if (lastError?.name === 'TypeError' && lastError.message.includes('fetch')) {
    throw new Error('Impossible de contacter le service de paiement Monetbil. Vérifiez votre connexion internet.')
  }
  
  // Check if it's a configuration issue (403/401 errors typically mean bad credentials)
  if (lastError?.message.includes('403') || lastError?.message.includes('401')) {
    throw new Error('Clés API Monetbil invalides. Veuillez vérifier votre configuration.')
  }

  // Generic error for other cases
  throw new Error('Service de paiement Monetbil temporairement indisponible. Veuillez réessayer dans quelques minutes.')
}
