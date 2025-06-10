
export interface AuditLog {
  id: string;
  transaction_id: string;
  event_type: string;
  event_data: any;
  ip_address: string | null;
  user_agent: string | null;
  security_flags: any;
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
  'payment_retry_attempt',
  'payment_retry_success',
  'payment_retry_failed',
  'lygos_callback_processed',
  'transaction_expired',
  'lock_attempt',
  'lock_released',
  'security_event_detected'
] as const;
