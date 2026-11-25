import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BookCard } from "@/components/storefront/BookCard";
import { CatalogFilters } from "@/components/storefront/CatalogFilters";
import { StaggerGrid } from "@/components/motion/MotionPrimitives";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Catalog",
  description:
    "Search and filter hardcover, paperback, and e-book editions by genre, author, ISBN, price, and ratings.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const str = (k: string) => {
    const val = sp[k];
    return typeof val === "string" ? val.trim() : "";
  };

  const q = str("q");
  const category = str("category");
  const format = str("format").toUpperCase();
  const language = str("language");
  const minPrice = str("minPrice") ? Number(str("minPrice")) : undefined;
  const maxPrice = str("maxPrice") ? Number(str("maxPrice")) : undefined;
  const minRating = str("minRating") ? Number(str("minRating")) : undefined;
  const featured = str("featured") === "true";
  const sort = str("sort") || "newest";
  const page = Math.max(1, Number(str("page") || 1));
  const limit = 12;

  const where: Prisma.BookWhereInput = { isActive: true };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { author: { contains: q } },
      { isbn10: { contains: q } },
      { isbn13: { contains: q } },
      { publisher: { contains: q } },
    ];
  }
  if (category) where.category = { slug: category };
  if (format === "PAPERBACK" || format === "HARDCOVER" || format === "EBOOK") {
    where.format = format;
  }
  if (language) where.language = language;
  if (featured) where.isFeatured = true;
  if (minRating != null && Number.isFinite(minRating)) {
    where.ratingAvg = { gte: minRating };
  }
  if (
    (minPrice != null && Number.isFinite(minPrice)) ||
    (maxPrice != null && Number.isFinite(maxPrice))
  ) {
    where.price = {};
    if (minPrice != null && Number.isFinite(minPrice)) where.price.gte = minPrice;
    if (maxPrice != null && Number.isFinite(maxPrice)) where.price.lte = maxPrice;
  }

  let orderBy: Prisma.BookOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "price_desc") orderBy = { price: "desc" };
  else if (sort === "bestsellers") orderBy = { orderItems: { _count: "desc" } };
  else if (sort === "rating") orderBy = { ratingAvg: "desc" };

  const [books, total, categories, distinctLanguages] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.book.count({ where }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { books: { where: { isActive: true } } } } },
    }),
    prisma.book.findMany({
      where: { isActive: true },
      distinct: ["language"],
      select: { language: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const languages = distinctLanguages.map((l) => l.language);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[var(--border-glass)] pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-editorial text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
            {q ? `Search: "${q}"` : "Book Catalog"}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Showing {books.length} of {total} curated titles
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Suspense
            fallback={
              <div className="glass-panel h-96 animate-pulse rounded-3xl" />
            }
          >
            <CatalogFilters categories={categories} languages={languages} />
          </Suspense>
        </div>

        <div className="lg:col-span-9">
          {books.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center">
              <h2 className="font-editorial text-2xl font-semibold text-[var(--text-primary)]">
                No books found
              </h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Try broadening your search terms or clearing active filters.
              </p>
              <Link
                href="/books"
                className="mt-5 inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-md"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <>
              <StaggerGrid className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </StaggerGrid>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => {
                      const nextParams = new URLSearchParams();
                      if (q) nextParams.set("q", q);
                      if (category) nextParams.set("category", category);
                      if (format) nextParams.set("format", format);
                      if (sort) nextParams.set("sort", sort);
                      nextParams.set("page", String(p));
                      return (
                        <Link
                          key={p}
                          href={`/books?${nextParams.toString()}`}
                          className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all ${
                            p === page
                              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                              : "glass-panel text-[var(--text-secondary)] hover:border-[var(--accent)]"
                          }`}
                        >
                          {p}
                        </Link>
                      );
                    }
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
