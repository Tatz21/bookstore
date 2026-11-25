import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators";
import {
  calculateShippingCost,
  calculateSubtotal,
  evaluateCoupon,
  getEffectiveUnitPrice,
  roundCurrency,
} from "@/lib/commerce";
import { getPaymentProvider } from "@/lib/payments";
import { serverEnv } from "@/lib/env";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid checkout payload" },
        { status: 400 }
      );
    }

    const { items, shippingAddress, guestEmail, couponCode } = parsed.data;
    const customerEmail = session?.user?.email || guestEmail;

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Email address is required for guest checkout" },
        { status: 400 }
      );
    }

    const bookIds = items.map((i) => i.bookId);
    const dbBooks = await prisma.book.findMany({
      where: { id: { in: bookIds }, isActive: true },
    });

    const bookMap = new Map(dbBooks.map((b) => [b.id, b]));
    const cartLines = [];

    for (const item of items) {
      const book = bookMap.get(item.bookId);
      if (!book) {
        return NextResponse.json(
          { error: "One or more books in your cart are unavailable" },
          { status: 400 }
        );
      }
      if (book.format !== "EBOOK" && book.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${book.title}" (available: ${book.stockQuantity})`,
          },
          { status: 409 }
        );
      }
      cartLines.push({ book, quantity: item.quantity });
    }

    const subtotal = calculateSubtotal(cartLines);

    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });
      const evaluation = evaluateCoupon(coupon, subtotal);
      if (!evaluation.valid) {
        return NextResponse.json(
          { error: evaluation.reason || "Invalid coupon" },
          { status: 400 }
        );
      }
      discountAmount = evaluation.discountAmount;
      appliedCouponCode = coupon!.code;
    }

    const subtotalAfterDiscount = roundCurrency(subtotal - discountAmount);
    const shippingAmount = calculateShippingCost({
      lines: cartLines,
      subtotalAfterDiscount,
      postalCode: shippingAddress.postalCode,
    });
    const totalAmount = roundCurrency(subtotalAfterDiscount + shippingAmount);

    const paymentProvider = getPaymentProvider();
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id || null,
        guestEmail: session?.user?.id ? null : customerEmail,
        subtotal,
        discountAmount,
        shippingAmount,
        totalAmount,
        couponCode: appliedCouponCode,
        status: "PENDING",
        paymentProvider: paymentProvider.name,
        shippingAddress: JSON.stringify(shippingAddress),
        items: {
          create: cartLines.map((line) => ({
            bookId: line.book.id,
            quantity: line.quantity,
            priceAtPurchase: getEffectiveUnitPrice(line.book),
          })),
        },
      },
    });

    const intent = await paymentProvider.createPaymentIntent({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: totalAmount,
      currency: serverEnv.currency,
      customerEmail,
      customerName: shippingAddress.fullName,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: intent.paymentIntentId },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      subtotal,
      discountAmount,
      shippingAmount,
      totalAmount,
      payment: intent,
    });
  } catch (err) {
    console.error("POST /api/checkout error:", err);
    return NextResponse.json(
      { error: "Unable to initiate checkout" },
      { status: 500 }
    );
  }
}
