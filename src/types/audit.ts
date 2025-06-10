
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

// Type helper for database audit log conversion
export const convertDatabaseAuditLog = (dbLog: any): AuditLog => ({
  id: dbLog.id,
  transaction_id: dbLog.transaction_id,
  event_type: dbLog.event_type,
  event_data: typeof dbLog.event_data === 'string' ? JSON.parse(dbLog.event_data) : (dbLog.event_data || {}),
  ip_address: dbLog.ip_address ? String(dbLog.ip_address) : null,
  user_agent: dbLog.user_agent || null,
  security_flags: typeof dbLog.security_flags === 'string' ? JSON.parse(dbLog.security_flags) : (dbLog.security_flags || {}),
  created_at: dbLog.created_at
});
