
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  reward_points: number;
  progress: number;
  target: number;
  status: 'active' | 'completed' | 'locked';
  time_left?: string;
  special_reward?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  unlocked: boolean;
  progress: number;
  required: number;
  reward_points: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  level: number;
  badge: string;
  streak: number;
}
