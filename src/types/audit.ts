
export interface AuditLog {
  id: string;
  transaction_id: string;
  event_type: string;
  event_data: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  security_flags: Record<string, any> | null;
  created_at: string;
}

export interface AuditFilters {
  startDate: string;
  endDate: string;
  eventType: string;
  transactionId: string;
}

export const AUDIT_EVENT_TYPES = [
  'payment_created',
  'payment_completed',
  'payment_failed',
  'payment_cancelled',
  'payment_verification_performed',
  'payment_verification_failed',
  'payment_creation_failed',
  'security_event',
  'user_action',
  'system_action'
];
