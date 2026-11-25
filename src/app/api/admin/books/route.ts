import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookPayloadSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let candidate = baseSlug || `book-${Date.now()}`;
  let suffix = 1;
  while (await prisma.book.findUnique({ where: { slug: candidate } })) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  const lowStockOnly = req.nextUrl.searchParams.get("lowStock") === "true";

  const books = await prisma.book.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { author: { contains: q } },
              { isbn13: { contains: q } },
              { isbn10: { contains: q } },
            ],
          }
        : {}),
      ...(lowStockOnly
        ? { stockQuantity: { lt: 5 }, format: { not: "EBOOK" } }
        : {}),
    },
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ books });
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = bookPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid book payload" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const baseSlug = slugify(data.slug || `${data.title}-${data.author}`);
    const slug = await ensureUniqueSlug(baseSlug);

    const book = await prisma.book.create({
      data: {
        title: data.title,
        slug,
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
    revalidatePath(`/books/${book.slug}`);

    return NextResponse.json({ book }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/books error:", err);
    return NextResponse.json(
      { error: "Failed to create book (check if ISBN already exists)" },
      { status: 400 }
    );
  }
}
