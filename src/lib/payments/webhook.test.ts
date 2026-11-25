import { describe, expect, it } from "vitest";
import { mockPaymentAdapter, signMockPayload } from "./mock";
import { serverEnv } from "../env";

describe("payment webhook verification", () => {
  it("verifies signed mock payment.captured webhook", async () => {
    const rawBody = JSON.stringify({
      event: "payment.captured",
      orderId: "ord_123",
      paymentIntentId: "mock_pi_ord_123",
      paymentId: "mock_pay_999",
    });
    const sig = signMockPayload(rawBody, serverEnv.authSecret);
    const headers = new Headers({ "x-mock-signature": sig });

    const res = await mockPaymentAdapter.verifyWebhook(rawBody, headers);
    expect(res.valid).toBe(true);
    expect(res.eventType).toBe("payment.succeeded");
    expect(res.orderId).toBe("ord_123");
  });

  it("rejects tampered webhook signature", async () => {
    const rawBody = JSON.stringify({ event: "payment.captured", orderId: "ord_123" });
    const headers = new Headers({ "x-mock-signature": "bad_sig" });

    const res = await mockPaymentAdapter.verifyWebhook(rawBody, headers);
    expect(res.valid).toBe(false);
  });
});
