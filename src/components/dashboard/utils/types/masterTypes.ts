
import { AffiliateStats } from "@/services/affiliateService";

export interface MasterMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  description: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  progress: number;
  type: 'performance' | 'network' | 'efficiency' | 'innovation' | 'achievement' | 'consistency';
}

export interface EliteGoal {
  id: string;
  title: string;
  description: string;
  current_value: number;
  target_value: number;
  unit: string;
  category: 'growth' | 'influence' | 'innovation' | 'community';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  reward: string;
}

export interface PerformanceInsight {
  id: string;
  title: string;
  insight: string;
  action_required: boolean;
  impact_level: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  data_source: string;
}
