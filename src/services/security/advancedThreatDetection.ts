
import { supabase } from '@/integrations/supabase/client';

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
  affected_user_id?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ThreatPattern {
  id: string;
  pattern_name: string;
  pattern_type: string;
  threat_indicators: Record<string, any>;
  risk_weight: number;
  is_active: boolean;
  auto_block_threshold: number;
}

export interface SecurityMetrics {
  total_alerts: number;
  critical_alerts: number;
  high_risk_alerts: number;
  resolved_alerts: number;
  last_24h_alerts: number;
}

// Helper function to safely convert Json to Record<string, any>
const convertJsonToRecord = (jsonValue: any): Record<string, any> => {
  if (jsonValue === null || jsonValue === undefined) {
    return {};
  }
  if (typeof jsonValue === 'string') {
    try {
      return JSON.parse(jsonValue);
    } catch {
      return { raw: jsonValue };
    }
  }
  if (typeof jsonValue === 'object' && !Array.isArray(jsonValue)) {
    return jsonValue as Record<string, any>;
  }
  return { value: jsonValue };
};

export const getSecurityAlerts = async (): Promise<SecurityAlert[]> => {
  try {
    const { data, error } = await supabase
      .from('security_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching security alerts:', error);
      throw error;
    }

    // Convert the database records to SecurityAlert objects with proper type conversion
    const alerts: SecurityAlert[] = (data || []).map(alert => ({
      id: alert.id,
      alert_type: alert.alert_type,
      severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
      title: alert.title,
      description: alert.description,
      source_identifier: alert.source_identifier,
      source_type: alert.source_type as 'ip' | 'user' | 'device' | 'session',
      threat_data: convertJsonToRecord(alert.threat_data),
      risk_score: alert.risk_score,
      status: alert.status as 'active' | 'investigating' | 'resolved' | 'false_positive',
      affected_user_id: alert.affected_user_id,
      resolved_at: alert.resolved_at,
      resolved_by: alert.resolved_by,
      resolution_notes: alert.resolution_notes,
      created_at: alert.created_at,
      updated_at: alert.updated_at
    }));

    return alerts;
  } catch (error) {
    console.error('Failed to fetch security alerts:', error);
    return [];
  }
};

export const getThreatPatterns = async (): Promise<ThreatPattern[]> => {
  try {
    const { data, error } = await supabase
      .from('security_threat_patterns')
      .select('*')
      .eq('is_active', true)
      .order('risk_weight', { ascending: false });

    if (error) {
      console.error('Error fetching threat patterns:', error);
      throw error;
    }

    // Convert the database records to ThreatPattern objects with proper type conversion
    const patterns: ThreatPattern[] = (data || []).map(pattern => ({
      id: pattern.id,
      pattern_name: pattern.pattern_name,
      pattern_type: pattern.pattern_type,
      threat_indicators: convertJsonToRecord(pattern.threat_indicators),
      risk_weight: pattern.risk_weight,
      is_active: pattern.is_active,
      auto_block_threshold: pattern.auto_block_threshold
    }));

    return patterns;
  } catch (error) {
    console.error('Failed to fetch threat patterns:', error);
    return [];
  }
};

export const getSecurityMetrics = async (): Promise<SecurityMetrics> => {
  try {
    const { data: alerts, error } = await supabase
      .from('security_alerts')
      .select('severity, status, created_at');

    if (error) {
      console.error('Error fetching security metrics:', error);
      throw error;
    }

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const metrics: SecurityMetrics = {
      total_alerts: alerts?.length || 0,
      critical_alerts: alerts?.filter(a => a.severity === 'critical').length || 0,
      high_risk_alerts: alerts?.filter(a => ['high', 'critical'].includes(a.severity)).length || 0,
      resolved_alerts: alerts?.filter(a => a.status === 'resolved').length || 0,
      last_24h_alerts: alerts?.filter(a => new Date(a.created_at) > last24h).length || 0
    };

    return metrics;
  } catch (error) {
    console.error('Failed to fetch security metrics:', error);
    return {
      total_alerts: 0,
      critical_alerts: 0,
      high_risk_alerts: 0,
      resolved_alerts: 0,
      last_24h_alerts: 0
    };
  }
};

export const createSecurityAlert = async (alertData: Omit<SecurityAlert, 'id' | 'created_at' | 'updated_at'>): Promise<SecurityAlert | null> => {
  try {
    const { data, error } = await supabase
      .from('security_alerts')
      .insert({
        alert_type: alertData.alert_type,
        severity: alertData.severity,
        title: alertData.title,
        description: alertData.description,
        source_identifier: alertData.source_identifier,
        source_type: alertData.source_type,
        threat_data: alertData.threat_data,
        risk_score: alertData.risk_score,
        status: alertData.status,
        affected_user_id: alertData.affected_user_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating security alert:', error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      alert_type: data.alert_type,
      severity: data.severity as 'low' | 'medium' | 'high' | 'critical',
      title: data.title,
      description: data.description,
      source_identifier: data.source_identifier,
      source_type: data.source_type as 'ip' | 'user' | 'device' | 'session',
      threat_data: convertJsonToRecord(data.threat_data),
      risk_score: data.risk_score,
      status: data.status as 'active' | 'investigating' | 'resolved' | 'false_positive',
      affected_user_id: data.affected_user_id,
      resolved_at: data.resolved_at,
      resolved_by: data.resolved_by,
      resolution_notes: data.resolution_notes,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Failed to create security alert:', error);
    return null;
  }
};
