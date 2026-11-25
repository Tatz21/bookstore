import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminOrderUpdateSchema } from "@/lib/validators";
import { sendShippingUpdateEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = adminOrderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid order update" },
      { status: 400 }
    );
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      status: parsed.data.status,
      trackingNumber:
        parsed.data.trackingNumber !== undefined
          ? parsed.data.trackingNumber || null
          : undefined,
    },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const addr = JSON.parse(order.shippingAddress) as { fullName?: string };
  const recipient = order.user?.email || order.guestEmail;
  if (recipient) {
    await sendShippingUpdateEmail({
      to: recipient,
      customerName: order.user?.name || addr.fullName || "Reader",
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
    });
  }

  return NextResponse.json({ order });
}
