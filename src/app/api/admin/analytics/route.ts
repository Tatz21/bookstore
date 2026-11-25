import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [orders, lowStockBooks, totalBooks, topOrderItems] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { totalAmount: true, status: true },
    }),
    prisma.book.findMany({
      where: {
        isActive: true,
        format: { not: "EBOOK" },
        stockQuantity: { lt: 5 },
      },
      orderBy: { stockQuantity: "asc" },
      select: {
        id: true,
        title: true,
        author: true,
        slug: true,
        stockQuantity: true,
      },
    }),
    prisma.book.count({ where: { isActive: true } }),
    prisma.orderItem.groupBy({
      by: ["bookId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const paidRevenue = orders
    .filter((o) => o.status !== "PENDING")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const topBookIds = topOrderItems.map((i) => i.bookId);
  const topBooksMap = new Map(
    (
      await prisma.book.findMany({
        where: { id: { in: topBookIds } },
        select: { id: true, title: true, author: true, price: true, stockQuantity: true },
      })
    ).map((b) => [b.id, b])
  );

  const topSellingBooks = topOrderItems
    .map((item) => {
      const book = topBooksMap.get(item.bookId);
      if (!book) return null;
      return {
        ...book,
        unitsSold: item._sum.quantity || 0,
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    totalRevenue: Math.round(paidRevenue * 100) / 100,
    totalOrders: orders.length,
    totalBooks,
    lowStockCount: lowStockBooks.length,
    lowStockBooks,
    topSellingBooks,
  });
}
