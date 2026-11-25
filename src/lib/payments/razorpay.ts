import crypto from "node:crypto";
import type {
  CreatePaymentIntentInput,
  PaymentIntentResult,
  PaymentProviderAdapter,
  VerifiedWebhookEvent,
} from "./types";
import { serverEnv } from "../env";

export const razorpayAdapter: PaymentProviderAdapter = {
  name: "razorpay",

  async createPaymentIntent(
    input: CreatePaymentIntentInput
  ): Promise<PaymentIntentResult> {
    if (!serverEnv.razorpayKeyId || !serverEnv.razorpayKeySecret) {
      throw new Error("Razorpay credentials are not configured");
    }

    const authHeader = Buffer.from(
      `${serverEnv.razorpayKeyId}:${serverEnv.razorpayKeySecret}`
    ).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(input.amount * 100), // paise
        currency: input.currency,
        receipt: input.orderNumber,
        notes: {
          orderId: input.orderId,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Razorpay order creation failed: ${errText}`);
    }

    const data = (await response.json()) as { id: string; amount: number; currency: string };

    return {
      provider: "razorpay",
      paymentIntentId: data.id,
      clientPayload: {
        mode: "razorpay",
        keyId: serverEnv.razorpayKeyId,
        razorpayOrderId: data.id,
        amount: data.amount,
        currency: data.currency,
        name: serverEnv.storeName,
        description: `Order ${input.orderNumber}`,
        prefill: {
          name: input.customerName,
          email: input.customerEmail,
        },
      },
    };
  },

  async verifyWebhook(
    rawBody: string,
    headers: Headers
  ): Promise<VerifiedWebhookEvent> {
    const signature = headers.get("x-razorpay-signature") || "";
    const secret = serverEnv.razorpayWebhookSecret;
    if (!secret || !signature) {
      return { valid: false, eventType: "ignored", reason: "Missing Razorpay webhook secret or signature" };
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, eventType: "ignored", reason: "Invalid Razorpay signature" };
    }

    const body = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
            notes?: { orderId?: string };
          };
        };
      };
    };

    const entity = body.payload?.payment?.entity;
    if (body.event === "payment.captured" || body.event === "order.paid") {
      return {
        valid: true,
        eventType: "payment.succeeded",
        orderId: entity?.notes?.orderId,
        paymentIntentId: entity?.order_id,
        paymentId: entity?.id,
      };
    }

    if (body.event === "payment.failed") {
      return {
        valid: true,
        eventType: "payment.failed",
        orderId: entity?.notes?.orderId,
        paymentIntentId: entity?.order_id,
      };
    }

    return { valid: true, eventType: "ignored" };
  },
};
