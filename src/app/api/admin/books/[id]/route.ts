import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookPayloadSchema } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  return NextResponse.json({ book });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const body = await req.json();

  // Quick stock/price patch support
  if (
    Object.keys(body).length <= 3 &&
    (body.stockQuantity !== undefined ||
      body.price !== undefined ||
      body.isActive !== undefined)
  ) {
    const updated = await prisma.book.update({
      where: { id },
      data: {
        ...(body.stockQuantity !== undefined
          ? { stockQuantity: Math.max(0, Number(body.stockQuantity)) }
          : {}),
        ...(body.price !== undefined
          ? { price: Math.max(1, Number(body.price)) }
          : {}),
        ...(body.isActive !== undefined
          ? { isActive: Boolean(body.isActive) }
          : {}),
      },
    });
    revalidatePath("/");
    revalidatePath("/books");
    revalidatePath(`/books/${existing.slug}`);
    return NextResponse.json({ book: updated });
  }

  const parsed = bookPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid update payload" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updated = await prisma.book.update({
    where: { id },
    data: {
      title: data.title,
      author: data.author,
      authorBio: data.authorBio || null,
      isbn10: data.isbn10 || null,
      isbn13: data.isbn13 || null,
      description: data.description,
      price: data.price,
      discountPrice: data.discountPrice ?? null,
      stockQuantity: data.stockQuantity,
      weightGrams: data.format === "EBOOK" ? 0 : data.weightGrams,
      coverImageUrl: data.coverImageUrl,
      galleryUrls: JSON.stringify(data.galleryUrls || []),
      format: data.format,
      language: data.language,
      pages: data.pages ?? null,
      publisher: data.publisher || null,
      publishedDate: data.publishedDate || null,
      categoryId: data.categoryId,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
    },
    include: { category: true },
  });

  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath(`/books/${updated.slug}`);

  return NextResponse.json({ book: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  // Soft-archive if book has historical order items to preserve referential integrity
  if (book._count.orderItems > 0) {
    await prisma.book.update({
      where: { id },
      data: { isActive: false },
    });
  } else {
    await prisma.book.delete({ where: { id } });
  }

  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath(`/books/${book.slug}`);

  return NextResponse.json({ ok: true });
}
