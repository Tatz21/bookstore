import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const statusParam = (req.nextUrl.searchParams.get("status") || "").toUpperCase();
  const isValidStatus = ORDER_STATUSES.includes(statusParam as OrderStatus);

  const orders = await prisma.order.findMany({
    where: isValidStatus ? { status: statusParam as OrderStatus } : {},
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          book: { select: { id: true, title: true, author: true, format: true } },
        },
      },
    },
  });

  return NextResponse.json({ orders });
}
