import { prisma } from "./prisma";
import { sendOrderConfirmationEmail } from "./email";

export async function fulfillOrderPayment(params: {
  orderId?: string;
  paymentIntentId?: string;
  paymentId?: string;
}) {
  const order = await prisma.order.findFirst({
    where: params.orderId
      ? { id: params.orderId }
      : { paymentIntentId: params.paymentIntentId },
    include: {
      items: {
        include: {
          book: {
            select: {
              id: true,
              title: true,
              format: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    return { ok: false as const, status: 404, message: "Order not found" };
  }

  // Idempotency guard: do not decrement stock twice on duplicate webhooks
  if (
    order.status === "PAID" ||
    order.status === "CONFIRMED" ||
    order.status === "SHIPPED" ||
    order.status === "DELIVERED"
  ) {
    return {
      ok: true as const,
      alreadyProcessed: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.book.format !== "EBOOK") {
        const updated = await tx.book.updateMany({
          where: {
            id: item.bookId,
            stockQuantity: { gte: item.quantity },
          },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new Error(
            `Insufficient stock while fulfilling "${item.book.title}"`
          );
        }
      }
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentId: params.paymentId || order.paymentId,
      },
    });

    if (order.couponCode) {
      await tx.coupon.updateMany({
        where: { code: order.couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    if (order.userId) {
      await tx.cartItem.deleteMany({
        where: { userId: order.userId },
      });
    }
  });

  const parsedAddr = JSON.parse(order.shippingAddress) as { fullName?: string };
  const recipient = order.user?.email || order.guestEmail;
  if (recipient) {
    await sendOrderConfirmationEmail({
      to: recipient,
      customerName: order.user?.name || parsedAddr.fullName || "Reader",
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      items: order.items.map((item) => ({
        title: item.book.title,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      })),
    });
  }

  return {
    ok: true as const,
    alreadyProcessed: false,
    orderId: order.id,
    orderNumber: order.orderNumber,
  };
}
