
export async function checkWebhookRateLimit(
  supabase: any,
  clientIP: string
): Promise<{ allowed: boolean; rateLimitInfo: any }> {
  console.log('Checking webhook rate limits for IP:', clientIP);
  
  // More restrictive rate limits for webhook calls
  const { data: ipRateLimit, error: rateLimitError } = await supabase
    .rpc('check_rate_limit', {
      p_identifier: clientIP,
      p_identifier_type: 'ip',
      p_action_type: 'webhook_call',
      p_max_requests: 20, // Reduced from 50 to 20 webhook calls per hour per IP
      p_window_minutes: 60
    });

  if (rateLimitError) {
    console.error('Webhook rate limit check error:', rateLimitError);
    // Fail secure - if we can't check rate limits, block the request
    return { allowed: false, rateLimitInfo: null };
  }

  if (ipRateLimit && !ipRateLimit.allowed) {
    console.log('Webhook rate limit exceeded for IP:', clientIP, ipRateLimit);
    
    // Log security event for excessive webhook calls
    await supabase
      .from('payment_security_events')
      .insert({
        event_type: 'webhook_rate_limit_exceeded',
        severity: 'high', // Increased severity
        identifier: clientIP,
        identifier_type: 'ip',
        event_data: {
          rate_limit_info: ipRateLimit,
          timestamp: new Date().toISOString()
        },
        risk_score: 60 // Increased risk score
      });

    return { allowed: false, rateLimitInfo: ipRateLimit };
  }

  return { allowed: true, rateLimitInfo: ipRateLimit };
}
