
export interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'points' | 'physical' | 'experience' | 'digital' | 'exclusive';
  cost: number;
  value: string;
  availability: 'available' | 'limited' | 'exclusive' | 'sold_out';
  required_level?: number;
  time_limited?: boolean;
  expires_at?: string;
  image_icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

export interface ElitePerks {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  required_points: number;
  icon: string;
  benefits: string[];
}

export interface VIPExperience {
  id: string;
  title: string;
  description: string;
  available_slots: number;
  total_slots: number;
  date: string;
  location: string;
  cost: number;
  perks: string[];
}
