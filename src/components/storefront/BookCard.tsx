"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getEffectiveUnitPrice } from "@/lib/commerce";
import { useCart, type CartBook } from "@/components/providers/CartProvider";
import { Badge } from "@/components/ui/badge";
import { BookOpeningCover } from "./BookOpeningCover";

export interface BookCardData extends CartBook {
  description?: string;
  ratingAvg: number;
  reviewCount: number;
  category?: { name: string; slug: string } | null;
}

export function BookCard({ book }: { book: BookCardData }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const effectivePrice = getEffectiveUnitPrice(book);
  const hasDiscount =
    book.discountPrice != null && book.discountPrice < book.price;
  const discountPct = hasDiscount
    ? Math.round(((book.price - effectivePrice) / book.price) * 100)
    : 0;
  const outOfStock = book.format !== "EBOOK" && book.stockQuantity <= 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || adding) return;
    setAdding(true);
    try {
      await addItem(book, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      // handled in drawer/cart
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="stagger-card glass-panel group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--accent)]/40 hover:shadow-2xl">
      {/* Subtle Hover Aura Border */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10" />

      <Link
        href={`/books/${book.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--surface-subtle)]/60"
      >
        <BookOpeningCover
          title={book.title}
          author={book.author}
          coverImageUrl={book.coverImageUrl}
          excerpt={book.description}
          format={book.format}
        />

        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
          <Badge
            variant="default"
            className="bg-black/65 text-white border-white/15 backdrop-blur-md"
          >
            {book.format}
          </Badge>
          {hasDiscount && (
            <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white border-0 shadow-md">
              -{discountPct}%
            </Badge>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <span className="rounded-full border border-white/20 bg-black/75 px-3.5 py-1 text-xs font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="relative flex flex-1 flex-col p-4">
        {book.category && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
            {book.category.name}
          </span>
        )}
        <Link
          href={`/books/${book.slug}`}
          className="font-editorial mt-1 line-clamp-2 text-base font-semibold leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]"
        >
          {book.title}
        </Link>
        <p className="mt-1 line-clamp-1 text-xs text-[var(--text-muted)]">
          {book.author}
        </p>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold">
            {book.ratingAvg > 0 ? book.ratingAvg.toFixed(1) : "New"}
          </span>
          {book.reviewCount > 0 && (
            <span className="text-[var(--text-muted)]">({book.reviewCount})</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[var(--text-primary)]">
              {formatPrice(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[var(--text-muted)] line-through">
                {formatPrice(book.price)}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={outOfStock || adding}
            onClick={handleQuickAdd}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--text-primary)] px-3 text-xs font-semibold text-[var(--bg-canvas)] transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
