import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider, type PaymentProviderName } from "@/lib/payments";
import { fulfillOrderPayment } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let providerOverride: PaymentProviderName | undefined;

    if (req.headers.get("x-razorpay-signature")) {
      providerOverride = "razorpay";
    } else if (req.headers.get("stripe-signature")) {
      providerOverride = "stripe";
    } else if (req.headers.get("x-mock-signature")) {
      providerOverride = "mock";
    }

    const adapter = getPaymentProvider(providerOverride);
    const verified = await adapter.verifyWebhook(rawBody, req.headers);

    if (!verified.valid) {
      return NextResponse.json(
        { error: verified.reason || "Invalid webhook signature" },
        { status: 401 }
      );
    }

    if (verified.eventType === "payment.succeeded") {
      const result = await fulfillOrderPayment({
        orderId: verified.orderId,
        paymentIntentId: verified.paymentIntentId,
        paymentId: verified.paymentId,
      });

      if (!result.ok) {
        return NextResponse.json(
          { error: result.message },
          { status: result.status }
        );
      }
      return NextResponse.json({ received: true, ...result });
    }

    if (verified.eventType === "payment.failed" && (verified.orderId || verified.paymentIntentId)) {
      await prisma.order.updateMany({
        where: verified.orderId
          ? { id: verified.orderId, status: "PENDING" }
          : { paymentIntentId: verified.paymentIntentId, status: "PENDING" },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({ received: true, eventType: verified.eventType });
  } catch (err) {
    console.error("POST /api/webhooks/payment error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
