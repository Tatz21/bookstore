import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cartItemSchema } from "@/lib/validators";
import { z } from "zod";

const mergeCartSchema = z.object({
  items: z.array(cartItemSchema),
});

async function getFormattedCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      book: {
        include: { category: { select: { name: true, slug: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return items;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }
  const items = await getFormattedCart(session.user.id);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Support bulk merge from guest localStorage cart on login
  if (Array.isArray(body?.items)) {
    const parsed = mergeCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
    }
    for (const item of parsed.data.items) {
      const book = await prisma.book.findUnique({
        where: { id: item.bookId },
        select: { id: true, stockQuantity: true, format: true, isActive: true },
      });
      if (!book || !book.isActive) continue;
      const maxQty = book.format === "EBOOK" ? item.quantity : Math.min(item.quantity, book.stockQuantity);
      if (maxQty <= 0) continue;

      await prisma.cartItem.upsert({
        where: {
          userId_bookId: { userId: session.user.id, bookId: item.bookId },
        },
        update: { quantity: maxQty },
        create: {
          userId: session.user.id,
          bookId: item.bookId,
          quantity: maxQty,
        },
      });
    }
    const items = await getFormattedCart(session.user.id);
    return NextResponse.json({ items });
  }

  const parsed = cartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
  }

  const book = await prisma.book.findUnique({ where: { id: parsed.data.bookId } });
  if (!book || !book.isActive) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_bookId: { userId: session.user.id, bookId: parsed.data.bookId },
    },
  });

  const targetQty = (existing?.quantity ?? 0) + parsed.data.quantity;
  if (book.format !== "EBOOK" && targetQty > book.stockQuantity) {
    return NextResponse.json(
      { error: `Only ${book.stockQuantity} unit(s) available in stock` },
      { status: 400 }
    );
  }

  await prisma.cartItem.upsert({
    where: {
      userId_bookId: { userId: session.user.id, bookId: parsed.data.bookId },
    },
    update: { quantity: targetQty },
    create: {
      userId: session.user.id,
      bookId: parsed.data.bookId,
      quantity: targetQty,
    },
  });

  const items = await getFormattedCart(session.user.id);
  return NextResponse.json({ items });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = cartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart update" }, { status: 400 });
  }

  const book = await prisma.book.findUnique({ where: { id: parsed.data.bookId } });
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  if (book.format !== "EBOOK" && parsed.data.quantity > book.stockQuantity) {
    return NextResponse.json(
      { error: `Only ${book.stockQuantity} unit(s) available` },
      { status: 400 }
    );
  }

  await prisma.cartItem.upsert({
    where: {
      userId_bookId: { userId: session.user.id, bookId: parsed.data.bookId },
    },
    update: { quantity: parsed.data.quantity },
    create: {
      userId: session.user.id,
      bookId: parsed.data.bookId,
      quantity: parsed.data.quantity,
    },
  });

  const items = await getFormattedCart(session.user.id);
  return NextResponse.json({ items });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookId = req.nextUrl.searchParams.get("bookId");
  if (bookId) {
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id, bookId },
    });
  } else {
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    });
  }

  const items = await getFormattedCart(session.user.id);
  return NextResponse.json({ items });
}
