"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  _count: { books: number };
}

export function CatalogFilters({
  categories,
  languages,
}: {
  categories: CategoryOption[];
  languages: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const activeCategory = searchParams.get("category") || "";
  const activeFormat = searchParams.get("format") || "";
  const activeLanguage = searchParams.get("language") || "";
  const activeRating = searchParams.get("minRating") || "";
  const activeSort = searchParams.get("sort") || "newest";

  const pushParam = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (!v) params.delete(k);
      else params.set(k, v);
    }
    params.delete("page");
    router.push(`/books?${params.toString()}`);
  };

  const handleApplySearchAndPrice = (e: React.FormEvent) => {
    e.preventDefault();
    pushParam({
      q: q.trim() || null,
      minPrice: minPrice.trim() || null,
      maxPrice: maxPrice.trim() || null,
    });
  };

  const resetAll = () => {
    setQ("");
    setMinPrice("");
    setMaxPrice("");
    router.push("/books");
  };

  const hasFilters = Boolean(
    activeCategory ||
      activeFormat ||
      activeLanguage ||
      activeRating ||
      searchParams.get("q") ||
      searchParams.get("minPrice") ||
      searchParams.get("maxPrice")
  );

  return (
    <aside className="glass-panel space-y-6 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <Filter className="h-4 w-4 text-[var(--accent)]" />
          <span>Filter Catalog</span>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline cursor-pointer"
          >
            <X className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      <form onSubmit={handleApplySearchAndPrice} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">
            Search Keywords / ISBN
          </label>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title, author, ISBN..."
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">
            Price Range
          </label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <Input
              type="number"
              min="0"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" variant="outline" size="sm" className="w-full">
          Apply Search &amp; Price
        </Button>
      </form>

      {/* Genre */}
      <div className="space-y-2 border-t border-[var(--border-glass)] pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Genre
        </h3>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => pushParam({ category: null })}
            className={`block w-full rounded-xl px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${
              !activeCategory
                ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
            }`}
          >
            All Genres
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => pushParam({ category: cat.slug })}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                activeCategory === cat.slug
                  ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-xs text-[var(--text-muted)]">
                {cat._count.books}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div className="space-y-2 border-t border-[var(--border-glass)] pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Format
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {["", "PAPERBACK", "HARDCOVER", "EBOOK"].map((fmt) => (
            <button
              key={fmt || "ALL"}
              type="button"
              onClick={() => pushParam({ format: fmt || null })}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                activeFormat === fmt
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
                  : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {fmt || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Language & Rating */}
      <div className="space-y-3 border-t border-[var(--border-glass)] pt-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Language
          </label>
          <select
            value={activeLanguage}
            onChange={(e) => pushParam({ language: e.target.value || null })}
            className="mt-1.5 h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)]"
          >
            <option value="">All Languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Minimum Rating
          </label>
          <select
            value={activeRating}
            onChange={(e) => pushParam({ minRating: e.target.value || null })}
            className="mt-1.5 h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)]"
          >
            <option value="">Any Rating</option>
            <option value="4">4.0+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Sort By
          </label>
          <select
            value={activeSort}
            onChange={(e) => pushParam({ sort: e.target.value })}
            className="mt-1.5 h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)]"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="bestsellers">Bestsellers</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
