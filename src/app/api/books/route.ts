import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const q = (sp.get("q") || "").trim();
    const category = (sp.get("category") || "").trim();
    const format = (sp.get("format") || "").trim().toUpperCase();
    const language = (sp.get("language") || "").trim();
    const minPrice = sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined;
    const maxPrice = sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined;
    const minRating = sp.get("minRating")
      ? Number(sp.get("minRating"))
      : undefined;
    const featured = sp.get("featured") === "true";
    const sort = sp.get("sort") || "newest";
    const page = Math.max(1, Number(sp.get("page") || 1));
    const limit = Math.min(48, Math.max(1, Number(sp.get("limit") || 12)));

    const where: Prisma.BookWhereInput = {
      isActive: true,
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { author: { contains: q } },
        { isbn10: { contains: q } },
        { isbn13: { contains: q } },
        { publisher: { contains: q } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (format === "PAPERBACK" || format === "HARDCOVER" || format === "EBOOK") {
      where.format = format;
    }

    if (language) {
      where.language = { equals: language };
    }

    if (featured) {
      where.isFeatured = true;
    }

    if (minRating != null && Number.isFinite(minRating)) {
      where.ratingAvg = { gte: minRating };
    }

    if (
      (minPrice != null && Number.isFinite(minPrice)) ||
      (maxPrice != null && Number.isFinite(maxPrice))
    ) {
      where.price = {};
      if (minPrice != null && Number.isFinite(minPrice)) {
        where.price.gte = minPrice;
      }
      if (maxPrice != null && Number.isFinite(maxPrice)) {
        where.price.lte = maxPrice;
      }
    }

    let orderBy: Prisma.BookOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "bestsellers") {
      orderBy = { orderItems: { _count: "desc" } };
    } else if (sort === "rating") {
      orderBy = { ratingAvg: "desc" };
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.book.count({ where }),
    ]);

    return NextResponse.json({
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("GET /api/books error:", err);
    return NextResponse.json(
      { error: "Failed to load catalog" },
      { status: 500 }
    );
  }
}
