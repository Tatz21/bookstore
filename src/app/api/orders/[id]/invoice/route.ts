import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/invoice";
import { serverEnv } from "@/lib/env";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const orderNumberQuery = req.nextUrl.searchParams.get("orderNumber");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          book: { select: { title: true, author: true } },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner = Boolean(session?.user?.id && order.userId === session.user.id);
  const isGuestWithOrderNumber = Boolean(
    !order.userId && orderNumberQuery && orderNumberQuery === order.orderNumber
  );

  if (!isAdmin && !isOwner && !isGuestWithOrderNumber) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const shippingAddress = JSON.parse(order.shippingAddress) as {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  const pdfBytes = await generateInvoicePdf({
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    status: order.status,
    customerName: order.user?.name || shippingAddress.fullName || "Reader",
    customerEmail: order.user?.email || order.guestEmail || "N/A",
    shippingAddress,
    items: order.items.map((item) => ({
      title: item.book.title,
      author: item.book.author,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
    })),
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    shippingAmount: order.shippingAmount,
    totalAmount: order.totalAmount,
    currency: serverEnv.currency,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
    },
  });
}
