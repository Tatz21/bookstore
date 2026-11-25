import crypto from "node:crypto";
import type {
  CreatePaymentIntentInput,
  PaymentIntentResult,
  PaymentProviderAdapter,
  VerifiedWebhookEvent,
} from "./types";
import { serverEnv } from "../env";

export function signMockPayload(rawBody: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

export const mockPaymentAdapter: PaymentProviderAdapter = {
  name: "mock",

  async createPaymentIntent(
    input: CreatePaymentIntentInput
  ): Promise<PaymentIntentResult> {
    const paymentIntentId = `mock_pi_${input.orderId}`;
    return {
      provider: "mock",
      paymentIntentId,
      clientPayload: {
        mode: "mock",
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        amount: input.amount,
        currency: input.currency,
        paymentIntentId,
      },
    };
  },

  async verifyWebhook(
    rawBody: string,
    headers: Headers
  ): Promise<VerifiedWebhookEvent> {
    const sig = headers.get("x-mock-signature") || "";
    const expected = signMockPayload(rawBody, serverEnv.authSecret);

    // Allow unsigned test payloads ONLY if x-mock-dev-bypass matches authSecret hash or signature matches
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (
      sigBuf.length !== expBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expBuf)
    ) {
      return {
        valid: false,
        eventType: "ignored",
        reason: "Invalid mock webhook signature",
      };
    }

    const payload = JSON.parse(rawBody) as {
      event?: string;
      orderId?: string;
      paymentIntentId?: string;
      paymentId?: string;
    };

    if (payload.event === "payment.captured" || payload.event === "payment.succeeded") {
      return {
        valid: true,
        eventType: "payment.succeeded",
        orderId: payload.orderId,
        paymentIntentId: payload.paymentIntentId,
        paymentId: payload.paymentId || `mock_pay_${Date.now()}`,
      };
    }

    if (payload.event === "payment.failed") {
      return {
        valid: true,
        eventType: "payment.failed",
        orderId: payload.orderId,
        paymentIntentId: payload.paymentIntentId,
      };
    }

    return { valid: true, eventType: "ignored" };
  },
};
