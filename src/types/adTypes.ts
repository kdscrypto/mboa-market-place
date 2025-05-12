
export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  region: string;
  phone: string;
  whatsapp?: string;
  status: string;
  created_at: string;
  imageUrl: string;
  user_id: string;
  is_premium?: boolean;
  ad_type?: string;
  reject_reason?: string;
}
