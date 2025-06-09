
export interface SubmissionState {
  isLoading: boolean;
  isSubmitted: boolean;
}

export interface SubmissionResult {
  success: boolean;
  adId?: string;
  error?: string;
}

export interface AdSubmissionData {
  title: string;
  description: string;
  category: string;
  price: string;
  region: string;
  city: string;
  phone: string;
  whatsapp?: string;
  adType: string;
  premiumExpiresAt?: string;
}
