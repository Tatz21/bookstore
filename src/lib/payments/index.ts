import { serverEnv } from "../env";
import { mockPaymentAdapter } from "./mock";
import { razorpayAdapter } from "./razorpay";
import { stripeAdapter } from "./stripe";
import type { PaymentProviderAdapter, PaymentProviderName } from "./types";

export function getPaymentProvider(
  override?: PaymentProviderName
): PaymentProviderAdapter {
  const provider = override || serverEnv.paymentProvider;
  if (provider === "razorpay" && serverEnv.razorpayKeyId && serverEnv.razorpayKeySecret) {
    return razorpayAdapter;
  }
  if (provider === "stripe" && serverEnv.stripeSecretKey) {
    return stripeAdapter;
  }
  return mockPaymentAdapter;
}

export * from "./types";
export { signMockPayload } from "./mock";
