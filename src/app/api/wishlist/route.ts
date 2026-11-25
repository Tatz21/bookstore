import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      book: {
        include: { category: { select: { name: true, slug: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await req.json()) as { bookId?: string };
  if (!body.bookId) {
    return NextResponse.json({ error: "bookId is required" }, { status: 400 });
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_bookId: { userId: session.user.id, bookId: body.bookId },
    },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ wishlisted: false });
  }

  await prisma.wishlistItem.create({
    data: {
      userId: session.user.id,
      bookId: body.bookId,
    },
  });

  return NextResponse.json({ wishlisted: true });
}
