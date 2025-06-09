
export interface VerificationTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message?: string;
  details?: any;
}

export interface MigrationStats {
  total_ads: number;
  standard_ads: number;
  migration_completed: boolean;
  all_ads_free: boolean;
  obsolete_transactions: number;
  total_transactions: number;
  migration_logs_count: number;
  last_migration_check: string;
}
