
export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  identifier: string;
  identifier_type: string;
  risk_score: number;
  auto_blocked: boolean;
  reviewed: boolean;
  created_at: string;
  event_data: any;
}

export interface SecurityStats {
  total_events: number;
  high_risk_events: number;
  auto_blocked_events: number;
  pending_review: number;
  last_24h_events: number;
}
