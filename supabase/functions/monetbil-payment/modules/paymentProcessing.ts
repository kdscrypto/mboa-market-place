
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
  // A valid Monetbil token should be alphanumeric and not contain HTML
  const htmlPattern = /<[^>]*>/
  const scriptPattern = /<script[^>]*>.*?<\/script>/i
  
  if (htmlPattern.test(token) || scriptPattern.test(token)) {
    return false
  }
  
  // Check if it's a reasonable token length and format
  return token.length > 5 && token.length < 100 && /^[a-zA-Z0-9_-]+$/.test(token)
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
  
  // Construct the Monetbil request data according to their latest API spec
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
    user: userId.substring(0, 8),
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

  console.log('Form data prepared for submission')

  // Updated endpoints based on Monetbil's current API documentation
  const endpoints = [
    'https://api.monetbil.com/payment/v1/placePayment',
    'https://api.monetbil.com/widget/v2.1/',
    'https://monetbil.com/api/v1/widget'
  ]

  let lastError: Error | null = null

  for (const endpoint of endpoints) {
    try {
      console.log(`Attempting payment with endpoint: ${endpoint}`)

      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'MBOA-Market/1.0',
        'Accept': 'application/json, text/plain, */*',
        'Cache-Control': 'no-cache'
      }

      // Add service secret in header for newer API versions
      if (endpoint.includes('payment/v1')) {
        headers['Authorization'] = `Bearer ${serviceSecret}`
        headers['X-Service-Key'] = serviceKey
      } else {
        headers['X-Service-Secret'] = serviceSecret
      }

      const monetbilResponse = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: formBody.toString()
      })

      const responseText = await monetbilResponse.text()
      
      console.log(`Response from ${endpoint}:`, {
        status: monetbilResponse.status,
        statusText: monetbilResponse.statusText,
        resultLength: responseText.length,
        resultPreview: responseText.substring(0, 200),
        contentType: monetbilResponse.headers.get('content-type')
      })

      // Check for successful response
      if (monetbilResponse.ok) {
        // Try to parse as JSON first
        try {
          const jsonResponse = JSON.parse(responseText)
          if (jsonResponse.status === 'SUCCESS' && jsonResponse.token) {
            console.log('✓ Valid JSON response with token received from:', endpoint)
            return jsonResponse.token
          } else if (jsonResponse.payment_url) {
            console.log('✓ Valid JSON response with payment URL from:', endpoint)
            // Extract token from payment URL if present
            const urlMatch = jsonResponse.payment_url.match(/\/([a-zA-Z0-9_-]+)$/)
            if (urlMatch) {
              return urlMatch[1]
            }
          }
        } catch (jsonError) {
          // If not JSON, check if it's a direct token
          const trimmedResponse = responseText.trim()
          if (isValidMonetbilToken(trimmedResponse)) {
            console.log('✓ Valid token received as plain text from:', endpoint)
            return trimmedResponse
          }
        }
      }

      // Log the specific error for this endpoint
      lastError = new Error(`Endpoint ${endpoint} returned status ${monetbilResponse.status}: ${responseText.substring(0, 200)}`)
      console.log(`✗ Endpoint failed: ${endpoint} - ${lastError.message}`)
      
    } catch (error) {
      console.error(`Network error with endpoint ${endpoint}:`, error)
      lastError = error instanceof Error ? error : new Error(String(error))
      continue
    }
  }

  // All endpoints failed - provide detailed error information
  console.error('All Monetbil endpoints failed. Last error:', lastError?.message)
  
  // Enhanced error analysis
  if (lastError?.message.includes('401') || lastError?.message.includes('403')) {
    throw new Error('Authentification Monetbil échouée. Vérifiez vos clés API dans les paramètres.')
  }
  
  if (lastError?.message.includes('400')) {
    throw new Error('Données de paiement invalides. Vérifiez le numéro de téléphone et le montant.')
  }
  
  if (lastError?.message.includes('404')) {
    throw new Error('Service Monetbil temporairement indisponible. L\'API pourrait être en maintenance.')
  }
  
  if (lastError?.message.includes('500') || lastError?.message.includes('502') || lastError?.message.includes('503')) {
    throw new Error('Erreur serveur Monetbil. Veuillez réessayer dans quelques minutes.')
  }

  // Network-related errors
  if (lastError?.name === 'TypeError' && lastError.message.includes('fetch')) {
    throw new Error('Impossible de contacter Monetbil. Vérifiez votre connexion internet.')
  }

  // Generic error for other cases
  throw new Error('Service de paiement Monetbil temporairement indisponible. Veuillez réessayer dans quelques minutes.')
}
