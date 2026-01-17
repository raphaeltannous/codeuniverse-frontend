export interface SubscriptionResponse {
  customerId: string;
  email: string;
  status: string;
}

export interface CheckoutSessionResponse {
  message: string;
  clientSecret: string;
}

export interface UpdatePaymentResponse {
  message: string;
  portalUrl: string;
}
