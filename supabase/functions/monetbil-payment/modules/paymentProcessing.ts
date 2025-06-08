
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
  if (!serviceKey || serviceKey.length < 20) {
    throw new Error('Clé de service Monetbil invalide ou manquante')
  }
  
  if (!serviceSecret || serviceSecret.length < 20) {
    throw new Error('Secret de service Monetbil invalide ou manquant')
  }
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
  console.log('Starting Monetbil API call with enhanced validation...')
  
  // Validate credentials first
  try {
    validateMonetbilCredentials(serviceKey, serviceSecret)
  } catch (error) {
    console.error('Monetbil credentials validation failed:', error.message)
    throw new Error('Configuration Monetbil invalide. Veuillez vérifier vos clés API.')
  }
  
  // Validate amount
  if (amount <= 0) {
    throw new Error('Montant de paiement invalide')
  }
  
  // Prepare phone number (ensure it's valid for Cameroon)
  let phoneNumber = adData.phone
  if (phoneNumber.startsWith('0')) {
    phoneNumber = '237' + phoneNumber.substring(1)
  } else if (!phoneNumber.startsWith('237')) {
    phoneNumber = '237' + phoneNumber
  }
  
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
    payment_ref: `MBOA_${transactionId}`,
    user: userId,
    first_name: 'Utilisateur',
    last_name: 'MBOA',
    email: userEmail || `${userId}@mboa.cm`
  }

  console.log('Monetbil request data:', {
    service: serviceKey.substring(0, 8) + '...',
    amount: amount.toString(),
    phone: phoneNumber,
    currency: 'XAF',
    item_ref: transactionId,
    payment_ref: `MBOA_${transactionId}`
  })

  const formBody = new URLSearchParams()
  Object.entries(monetbilData).forEach(([key, value]) => {
    formBody.append(key, value)
  })

  console.log('Calling Monetbil API...')

  try {
    const monetbilResponse = await fetch('https://api.monetbil.com/widget/v2.1/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Service-Secret': serviceSecret,
        'User-Agent': 'MBOA-Market/1.0',
        'Accept': 'text/plain, */*'
      },
      body: formBody.toString()
    })

    const monetbilResult = await monetbilResponse.text()
    
    console.log('Monetbil API response:', {
      status: monetbilResponse.status,
      statusText: monetbilResponse.statusText,
      resultLength: monetbilResult.length,
      resultPreview: monetbilResult.substring(0, 200),
      headers: Object.fromEntries(monetbilResponse.headers.entries())
    })

    // Enhanced error handling
    if (!monetbilResponse.ok) {
      console.error('Monetbil API HTTP error:', {
        status: monetbilResponse.status,
        statusText: monetbilResponse.statusText,
        response: monetbilResult
      })
      
      if (monetbilResponse.status === 404) {
        throw new Error('Service Monetbil temporairement indisponible. Veuillez réessayer dans quelques minutes.')
      } else if (monetbilResponse.status === 401 || monetbilResponse.status === 403) {
        throw new Error('Clés API Monetbil invalides. Veuillez vérifier votre configuration.')
      } else {
        throw new Error(`Erreur du service de paiement (${monetbilResponse.status}). Veuillez réessayer.`)
      }
    }

    // Check if response contains HTML error
    if (monetbilResult.includes('<h1>') || monetbilResult.includes('<!DOCTYPE') || monetbilResult.includes('<html')) {
      console.error('Monetbil returned HTML error page:', monetbilResult)
      
      // Extract error message from HTML if possible
      const errorMatch = monetbilResult.match(/<h1[^>]*>(.*?)<\/h1>/i)
      if (errorMatch) {
        const errorMessage = errorMatch[1].trim()
        if (errorMessage.toLowerCase().includes('not found')) {
          throw new Error('Service de paiement temporairement indisponible. Veuillez réessayer plus tard.')
        } else {
          throw new Error(`Erreur Monetbil: ${errorMessage}`)
        }
      }
      
      throw new Error('Erreur du service de paiement. Veuillez vérifier votre configuration Monetbil.')
    }

    // Validate if we received a proper token
    if (!isValidMonetbilToken(monetbilResult)) {
      console.error('Invalid Monetbil token received:', {
        token: monetbilResult,
        length: monetbilResult.length,
        containsHtml: /<[^>]*>/.test(monetbilResult)
      })
      
      throw new Error('Réponse invalide du service de paiement. Veuillez vérifier votre configuration Monetbil.')
    }

    console.log('Valid Monetbil token received:', monetbilResult.substring(0, 20) + '...')
    return monetbilResult

  } catch (error) {
    console.error('Monetbil API call failed:', error)
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Impossible de contacter le service de paiement. Vérifiez votre connexion internet.')
    }
    
    // Re-throw our custom errors as-is
    if (error.message.startsWith('Service Monetbil') || 
        error.message.startsWith('Clés API Monetbil') || 
        error.message.startsWith('Erreur Monetbil') ||
        error.message.startsWith('Erreur du service de paiement') ||
        error.message.startsWith('Réponse invalide') ||
        error.message.startsWith('Impossible de contacter')) {
      throw error
    }
    
    // For any other errors, provide a generic message
    throw new Error('Erreur lors de la communication avec le service de paiement. Veuillez réessayer.')
  }
}
