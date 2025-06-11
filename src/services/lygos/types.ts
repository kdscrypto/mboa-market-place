
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
    created_at: string;
    expires_at: string;
  };
  error?: string;
  transactionId?: string;
}

export interface LygosPaymentData {
  payment_url: string;
  real_integration: boolean;
  created_via: string;
  payment_id: string;
  [key: string]: any;
}
