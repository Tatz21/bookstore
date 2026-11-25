export type PaymentProviderName = "mock" | "razorpay" | "stripe";

export interface CreatePaymentIntentInput {
  orderId: string;
  orderNumber: string;
  amount: number; // Major currency unit (e.g. INR rupees / USD dollars)
  currency: string;
  customerEmail: string;
  customerName: string;
}

export interface PaymentIntentResult {
  provider: PaymentProviderName;
  paymentIntentId: string;
  clientPayload: Record<string, unknown>;
}

export interface VerifiedWebhookEvent {
  valid: boolean;
  eventType: "payment.succeeded" | "payment.failed" | "ignored";
  orderId?: string;
  paymentIntentId?: string;
  paymentId?: string;
  reason?: string;
}

export interface PaymentProviderAdapter {
  name: PaymentProviderName;
  createPaymentIntent(
    input: CreatePaymentIntentInput
  ): Promise<PaymentIntentResult>;
  verifyWebhook(
    rawBody: string,
    headers: Headers
  ): Promise<VerifiedWebhookEvent>;
}
