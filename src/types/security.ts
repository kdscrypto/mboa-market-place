
export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  identifier: string;
  identifier_type: 'user' | 'ip' | 'device';
  event_data: Record<string, any>;
  risk_score: number;
  auto_blocked: boolean;
  reviewed: boolean;
  reviewed_at?: string;
  created_at: string;
}

export interface SecurityStats {
  total_events: number;
  high_risk_events: number;
  auto_blocked_events: number;
  pending_review: number;
  last_24h_events: number;
}

export interface RateLimitInfo {
  allowed: boolean;
  current_count?: number;
  max_requests?: number;
  blocked_until?: string;
  reason?: string;
}

export interface SuspiciousActivityResult {
  risk_score: number;
  auto_block: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  event_type: string;
}

// Type helper for database security event conversion
export const convertDatabaseSecurityEvent = (dbEvent: any): SecurityEvent => ({
  id: dbEvent.id,
  event_type: dbEvent.event_type,
  severity: dbEvent.severity as 'low' | 'medium' | 'high' | 'critical',
  identifier: dbEvent.identifier,
  identifier_type: dbEvent.identifier_type as 'user' | 'ip' | 'device',
  event_data: typeof dbEvent.event_data === 'string' ? JSON.parse(dbEvent.event_data) : (dbEvent.event_data || {}),
  risk_score: dbEvent.risk_score || 0,
  auto_blocked: dbEvent.auto_blocked || false,
  reviewed: dbEvent.reviewed || false,
  reviewed_at: dbEvent.reviewed_at,
  created_at: dbEvent.created_at
});
