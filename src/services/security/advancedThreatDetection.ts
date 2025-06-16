import { supabase } from '@/integrations/supabase/client';

export interface ThreatDetectionResult {
  risk_score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  auto_block: boolean;
  alert_id?: string;
  execution_time_ms: number;
}

export interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  source_identifier: string;
  source_type: 'ip' | 'user' | 'device' | 'session';
  threat_data: Record<string, any>;
  risk_score: number;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  created_at: string;
}

export const detectAdvancedThreats = async (
  identifier: string,
  identifierType: 'ip' | 'user' | 'device' | 'session',
  eventData: Record<string, any>,
  context: Record<string, any> = {}
): Promise<ThreatDetectionResult> => {
  try {
    const { data, error } = await supabase.rpc('detect_advanced_threats', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_event_data: eventData,
      p_context: context
    });

    if (error) {
      console.error('Advanced threat detection error:', error);
      throw error;
    }

    // Assurer que les données retournées correspondent au type attendu
    const result = data as unknown as ThreatDetectionResult;
    return result;
  } catch (error) {
    console.error('Failed to detect advanced threats:', error);
    throw error;
  }
};

export const getActiveSecurityAlerts = async (
  limit: number = 50
): Promise<SecurityAlert[]> => {
  try {
    const { data, error } = await supabase
      .from('security_alerts')
      .select('*')
      .eq('status', 'active')
      .order('risk_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Type assertion pour assurer la compatibilité
    const typedAlerts = (data || []).map(alert => ({
      ...alert,
      severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
      source_type: alert.source_type as 'ip' | 'user' | 'device' | 'session',
      status: alert.status as 'active' | 'investigating' | 'resolved' | 'false_positive'
    }));
    
    return typedAlerts;
  } catch (error) {
    console.error('Failed to fetch security alerts:', error);
    return [];
  }
};

export const resolveSecurityAlert = async (
  alertId: string,
  status: 'investigating' | 'resolved' | 'false_positive',
  resolutionNotes?: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('resolve_security_alert', {
      p_alert_id: alertId,
      p_status: status,
      p_resolution_notes: resolutionNotes
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to resolve security alert:', error);
    return false;
  }
};

export const getSecurityMetrics = async (
  timeRange: '1h' | '24h' | '7d' = '24h'
): Promise<Record<string, number>> => {
  try {
    const hoursBack = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
    const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('security_metrics')
      .select('metric_name, value')
      .gte('time_bucket', startTime)
      .order('time_bucket', { ascending: false });

    if (error) throw error;

    // Aggregate metrics by name
    const metrics: Record<string, number> = {};
    data?.forEach(metric => {
      if (metric.metric_name && typeof metric.value === 'number') {
        metrics[metric.metric_name] = (metrics[metric.metric_name] || 0) + metric.value;
      }
    });

    return metrics;
  } catch (error) {
    console.error('Failed to get security metrics:', error);
    return {};
  }
};

export const collectSecurityMetrics = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('collect_security_metrics');
    if (error) throw error;
  } catch (error) {
    console.error('Failed to collect security metrics:', error);
  }
};
