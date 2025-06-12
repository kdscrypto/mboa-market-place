
export interface LygosPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  metadata?: Record<string, any>;
}

export interface LygosPaymentResponse {
  success: boolean;
  paymentData?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    payment_url: string;
    checkout_url?: string;
    created_at: string;
    expires_at: string;
  };
  checkout_url?: string;
  error?: string;
  transactionId?: string;
}

export interface LygosPaymentData {
  payment_url: string;
  checkout_url?: string;
  real_integration: boolean;
  created_via: string;
  payment_id: string;
  [key: string]: any;
}

export interface LygosVerificationResponse {
  success: boolean;
  paymentData?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    created_at: string;
    updated_at: string;
  };
  transactionId?: string;
  error?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  max_requests?: number;
  current_count?: number;
  window_start?: string;
}
