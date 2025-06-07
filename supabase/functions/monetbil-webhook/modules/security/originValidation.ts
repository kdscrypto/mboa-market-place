
export async function validateWebhookOrigin(
  supabase: any,
  clientIP: string,
  userAgent: string
): Promise<{ valid: boolean; reason?: string }> {
  
  // Check if IP is from a suspicious or blocked range
  const { data: blockedIPs } = await supabase
    .from('payment_security_events')
    .select('identifier')
    .eq('identifier_type', 'ip')
    .eq('auto_blocked', true)
    .eq('identifier', clientIP)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

  if (blockedIPs && blockedIPs.length > 0) {
    return { 
      valid: false, 
      reason: 'IP address is temporarily blocked due to suspicious activity' 
    };
  }

  // Validate user agent is not suspicious
  if (!userAgent || userAgent.length < 10 || userAgent.includes('bot') || userAgent.includes('curl')) {
    return { 
      valid: false, 
      reason: 'Suspicious or missing user agent' 
    };
  }

  return { valid: true };
}
