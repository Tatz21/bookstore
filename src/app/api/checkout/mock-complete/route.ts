import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { fulfillOrderPayment } from "@/lib/orders";
import { z } from "zod";

const mockCompleteSchema = z.object({
  orderId: z.string().min(1),
  outcome: z.enum(["succeed", "fail"]).default("succeed"),
});

/**
 * Sandbox payment completion endpoint used exclusively when PAYMENT_PROVIDER === "mock".
 * Simulates the payment gateway completing payment and triggering verified fulfillment.
 */
export async function POST(req: NextRequest) {
  if (serverEnv.paymentProvider !== "mock") {
    return NextResponse.json(
      { error: "Mock checkout is disabled when a live payment gateway is active" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = mockCompleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data.outcome === "fail") {
    return NextResponse.json(
      { ok: false, error: "Simulated payment declined" },
      { status: 402 }
    );
  }

  try {
    const result = await fulfillOrderPayment({
      orderId: parsed.data.orderId,
      paymentId: `mock_pay_${Date.now()}`,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fulfillment failed" },
      { status: 409 }
    );
  }
}
