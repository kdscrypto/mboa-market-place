
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
  severity: string;
  event_type: string;
}
