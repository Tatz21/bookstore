import crypto from "node:crypto";
import type {
  CreatePaymentIntentInput,
  PaymentIntentResult,
  PaymentProviderAdapter,
  VerifiedWebhookEvent,
} from "./types";
import { serverEnv } from "../env";

export const stripeAdapter: PaymentProviderAdapter = {
  name: "stripe",

  async createPaymentIntent(
    input: CreatePaymentIntentInput
  ): Promise<PaymentIntentResult> {
    if (!serverEnv.stripeSecretKey) {
      throw new Error("Stripe secret key is not configured");
    }

    const params = new URLSearchParams({
      amount: String(Math.round(input.amount * 100)),
      currency: input.currency.toLowerCase(),
      receipt_email: input.customerEmail,
      "metadata[orderId]": input.orderId,
      "metadata[orderNumber]": input.orderNumber,
      "automatic_payment_methods[enabled]": "true",
    });

    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serverEnv.stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Stripe PaymentIntent failed: ${errText}`);
    }

    const data = (await response.json()) as {
      id: string;
      client_secret: string;
    };

    return {
      provider: "stripe",
      paymentIntentId: data.id,
      clientPayload: {
        mode: "stripe",
        paymentIntentId: data.id,
        clientSecret: data.client_secret,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      },
    };
  },

  async verifyWebhook(
    rawBody: string,
    headers: Headers
  ): Promise<VerifiedWebhookEvent> {
    const sigHeader = headers.get("stripe-signature") || "";
    const secret = serverEnv.stripeWebhookSecret;
    if (!secret || !sigHeader) {
      return { valid: false, eventType: "ignored", reason: "Missing Stripe webhook secret or signature" };
    }

    const parts = Object.fromEntries(
      sigHeader.split(",").map((kv) => {
        const [k, v] = kv.split("=");
        return [k?.trim(), v?.trim()];
      })
    );

    if (!parts.t || !parts.v1) {
      return { valid: false, eventType: "ignored", reason: "Malformed stripe-signature header" };
    }

    const signedPayload = `${parts.t}.${rawBody}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    const sigBuf = Buffer.from(parts.v1);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, eventType: "ignored", reason: "Invalid Stripe signature" };
    }

    const event = JSON.parse(rawBody) as {
      type?: string;
      data?: {
        object?: {
          id?: string;
          metadata?: { orderId?: string };
        };
      };
    };

    const obj = event.data?.object;
    if (event.type === "payment_intent.succeeded") {
      return {
        valid: true,
        eventType: "payment.succeeded",
        orderId: obj?.metadata?.orderId,
        paymentIntentId: obj?.id,
        paymentId: obj?.id,
      };
    }

    if (event.type === "payment_intent.payment_failed") {
      return {
        valid: true,
        eventType: "payment.failed",
        orderId: obj?.metadata?.orderId,
        paymentIntentId: obj?.id,
      };
    }

    return { valid: true, eventType: "ignored" };
  },
};
