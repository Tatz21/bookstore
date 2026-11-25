import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Sparkles,
  Truck,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BookCard } from "@/components/storefront/BookCard";
import { BookOpeningCover } from "@/components/storefront/BookOpeningCover";
import { Button } from "@/components/ui/button";
import {
  HeroEntrance,
  StaggerGrid,
  TiltShowcase,
} from "@/components/motion/MotionPrimitives";
import { formatPrice } from "@/lib/utils";
import { getEffectiveUnitPrice } from "@/lib/commerce";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredBooks, bestsellerBooks, categories] = await Promise.all([
    prisma.book.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: { select: { name: true, slug: true } } },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.book.findMany({
      where: { isActive: true },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: [{ orderItems: { _count: "desc" } }, { ratingAvg: "desc" }],
      take: 8,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { books: { where: { isActive: true } } } },
      },
    }),
  ]);

  const spotlight = featuredBooks[0] || bestsellerBooks[0];

  return (
    <div className="space-y-20 pb-14">
      {/* Kinetic New-Age Hero */}
      <section className="relative border-b border-[var(--border-glass)]">
        <HeroEntrance className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24">
          <div className="space-y-7 lg:col-span-7">
            <div className="hero-reveal inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-1.5 text-xs font-semibold text-[var(--accent)] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Curated New-Age Bookshop &middot; Light &amp; Midnight
            </div>

            <h1 className="hero-reveal font-editorial text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
              Books engineered to{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-500 bg-clip-text text-transparent">
                outlive trends
              </span>
              .
            </h1>

            <p className="hero-reveal max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              Discover tactile hardcovers, razor-sharp technical classics, and
              modern fiction. Built with live inventory, instant ISBN discovery,
              and seamless checkout.
            </p>

            <div className="hero-reveal flex flex-wrap gap-3 pt-1">
              <Link href="/books">
                <Button size="lg" variant="accent">
                  Explore the Catalog <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/books?sort=bestsellers">
                <Button size="lg" variant="outline">
                  Browse Bestsellers
                </Button>
              </Link>
            </div>

            <div className="hero-reveal grid grid-cols-3 gap-3 pt-4">
              <div className="glass-panel flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-xs text-[var(--text-secondary)]">
                <Truck className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span>Free delivery over ₹999</span>
              </div>
              <div className="glass-panel flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-xs text-[var(--text-secondary)]">
                <BookMarked className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>Print &amp; E-Books</span>
              </div>
              <div className="glass-panel flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-xs text-[var(--text-secondary)]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-amber-500" />
                <span>Instant PDF invoices</span>
              </div>
            </div>
          </div>

          {spotlight && (
            <div className="hero-reveal lg:col-span-5">
              <TiltShowcase className="mx-auto max-w-sm">
                <Link
                  href={`/books/${spotlight.slug}`}
                  className="glass-panel-strong group relative flex flex-col overflow-hidden rounded-3xl p-5 transition-colors hover:border-[var(--accent)]/50"
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                    <span>Editor&rsquo;s Spotlight</span>
                    <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5">
                      {spotlight.format}
                    </span>
                  </div>
                  <div className="mt-3 aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[var(--surface-subtle)]/60">
                    <BookOpeningCover
                      title={spotlight.title}
                      author={spotlight.author}
                      coverImageUrl={spotlight.coverImageUrl}
                      excerpt={spotlight.description}
                      format={spotlight.format}
                    />
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-editorial truncate text-xl font-semibold text-[var(--text-primary)]">
                        {spotlight.title}
                      </h2>
                      <p className="truncate text-sm text-[var(--text-muted)]">
                        {spotlight.author}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-sm font-bold text-white shadow-md">
                      {formatPrice(getEffectiveUnitPrice(spotlight))}
                    </span>
                  </div>
                </Link>
              </TiltShowcase>
            </div>
          )}
        </HeroEntrance>
      </section>

      {/* Bento Genre Shelf */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
              <Compass className="h-3.5 w-3.5" /> Curated Shelves
            </span>
            <h2 className="font-editorial mt-1 text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
              Browse by Genre
            </h2>
          </div>
          <Link
            href="/books"
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            All Genres &rarr;
          </Link>
        </div>

        <StaggerGrid className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/books?category=${cat.slug}`}
              className={`stagger-card glass-panel group flex items-center justify-between rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/50 ${
                idx === 0 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div>
                <h3 className="font-editorial text-lg font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="mt-1 line-clamp-1 text-xs text-[var(--text-muted)]">
                    {cat.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 rounded-full border border-[var(--border-strong)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">
                {cat._count.books}
              </span>
            </Link>
          ))}
        </StaggerGrid>
      </section>

      {/* Featured Editions */}
      {featuredBooks.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-editorial text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
                Featured Editions
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Handpicked highlights from our current collection.
              </p>
            </div>
            <Link
              href="/books?featured=true"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              View featured &rarr;
            </Link>
          </div>
          <StaggerGrid className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </StaggerGrid>
        </section>
      )}

      {/* Reader Favorites */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
              Reader Favorites
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Most-ordered and highest-rated titles across the store.
            </p>
          </div>
          <Link
            href="/books?sort=bestsellers"
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            See all bestsellers &rarr;
          </Link>
        </div>
        <StaggerGrid className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellerBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </StaggerGrid>
      </section>
    </div>
  );
}
