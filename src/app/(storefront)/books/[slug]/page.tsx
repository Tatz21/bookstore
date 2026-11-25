import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Star, BookOpen, Calendar, Building2, Globe, Hash } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { getEffectiveUnitPrice } from "@/lib/commerce";
import { Badge } from "@/components/ui/badge";
import { BookDetailClient } from "@/components/storefront/BookDetailClient";
import { TiltShowcase } from "@/components/motion/MotionPrimitives";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await prisma.book.findUnique({
    where: { slug },
    select: { title: true, author: true, description: true, coverImageUrl: true },
  });

  if (!book) {
    return { title: "Book Not Found" };
  }

  return {
    title: `${book.title} by ${book.author}`,
    description: book.description.slice(0, 155),
    openGraph: {
      title: `${book.title} — ${book.author}`,
      description: book.description.slice(0, 155),
      images: [{ url: book.coverImageUrl }],
    },
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const book = await prisma.book.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  if (!book || !book.isActive) {
    notFound();
  }

  const wishlistEntry = session?.user?.id
    ? await prisma.wishlistItem.findUnique({
        where: {
          userId_bookId: { userId: session.user.id, bookId: book.id },
        },
      })
    : null;

  const effectivePrice = getEffectiveUnitPrice(book);
  const hasDiscount =
    book.discountPrice != null && book.discountPrice < book.price;

  const stockStatus =
    book.format === "EBOOK"
      ? { label: "Instant Digital Delivery", variant: "success" as const }
      : book.stockQuantity === 0
      ? { label: "Out of Stock", variant: "danger" as const }
      : book.stockQuantity < 5
      ? { label: `Only ${book.stockQuantity} left in stock`, variant: "warning" as const }
      : { label: `In Stock (${book.stockQuantity} ready)`, variant: "success" as const };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author },
    isbn: book.isbn13 || book.isbn10 || undefined,
    numberOfPages: book.pages || undefined,
    inLanguage: book.language,
    publisher: book.publisher || undefined,
    image: book.coverImageUrl,
    offers: {
      "@type": "Offer",
      price: effectivePrice,
      priceCurrency: process.env.NEXT_PUBLIC_CURRENCY || "INR",
      availability:
        book.format === "EBOOK" || book.stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--text-primary)]">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/books?category=${book.category.slug}`}
          className="hover:text-[var(--text-primary)]"
        >
          {book.category.name}
        </Link>
        <span>/</span>
        <span className="truncate text-[var(--text-primary)]">{book.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Cover Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <TiltShowcase>
              <div className="glass-panel-strong overflow-hidden rounded-3xl p-6">
                <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--surface-subtle)] shadow-xl">
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </TiltShowcase>
          </div>
        </div>

        {/* Details Column */}
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{book.category.name}</Badge>
              <Badge variant="outline">{book.format}</Badge>
              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
            </div>

            <h1 className="font-editorial text-3xl font-semibold leading-tight text-[var(--text-primary)] sm:text-4xl">
              {book.title}
            </h1>

            <p className="text-base text-[var(--text-secondary)]">
              by{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {book.author}
              </span>
            </p>

            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-[var(--text-primary)]">
                  {book.ratingAvg > 0 ? book.ratingAvg.toFixed(1) : "New"}
                </span>
              </div>
              <span className="text-[var(--text-muted)]">
                ({book.reviewCount}{" "}
                {book.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="glass-panel flex items-baseline gap-3 rounded-2xl px-5 py-4">
            <span className="text-3xl font-bold text-[var(--text-primary)]">
              {formatPrice(effectivePrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-[var(--text-muted)] line-through">
                  {formatPrice(book.price)}
                </span>
                <Badge variant="accent">
                  Save {formatPrice(book.price - effectivePrice)}
                </Badge>
              </>
            )}
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h2 className="font-editorial text-xl font-semibold text-[var(--text-primary)]">
              Synopsis
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
              {book.description}
            </p>
          </div>

          {/* Book Specifications */}
          <div className="glass-panel grid grid-cols-2 gap-3 rounded-2xl p-5 text-xs sm:grid-cols-3">
            {book.isbn13 && (
              <div className="flex items-start gap-2">
                <Hash className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                <div>
                  <span className="block text-[var(--text-muted)]">ISBN-13</span>
                  <span className="font-mono font-medium text-[var(--text-primary)]">
                    {book.isbn13}
                  </span>
                </div>
              </div>
            )}
            {book.isbn10 && (
              <div className="flex items-start gap-2">
                <Hash className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                <div>
                  <span className="block text-[var(--text-muted)]">ISBN-10</span>
                  <span className="font-mono font-medium text-[var(--text-primary)]">
                    {book.isbn10}
                  </span>
                </div>
              </div>
            )}
            {book.pages && (
              <div className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                <div>
                  <span className="block text-[var(--text-muted)]">Pages</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {book.pages} pages
                  </span>
                </div>
              </div>
            )}
            {book.publisher && (
              <div className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                <div>
                  <span className="block text-[var(--text-muted)]">
                    Publisher
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {book.publisher}
                  </span>
                </div>
              </div>
            )}
            {book.publishedDate && (
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                <div>
                  <span className="block text-[var(--text-muted)]">
                    Published
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {book.publishedDate}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Globe className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
              <div>
                <span className="block text-[var(--text-muted)]">Language</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {book.language}
                </span>
              </div>
            </div>
          </div>

          <BookDetailClient
            book={{
              id: book.id,
              title: book.title,
              slug: book.slug,
              author: book.author,
              authorBio: book.authorBio,
              price: book.price,
              discountPrice: book.discountPrice,
              stockQuantity: book.stockQuantity,
              weightGrams: book.weightGrams,
              format: book.format,
              coverImageUrl: book.coverImageUrl,
            }}
            initialWishlisted={Boolean(wishlistEntry)}
            reviews={book.reviews.map((r) => ({
              ...r,
              createdAt: r.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
