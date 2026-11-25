"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  BookOpen,
  Search,
  ShoppingBag,
  User,
  ShieldCheck,
  LogOut,
  X,
} from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { formatPrice } from "@/lib/utils";
import { getEffectiveUnitPrice } from "@/lib/commerce";

interface SearchHit {
  id: string;
  title: string;
  slug: string;
  author: string;
  price: number;
  discountPrice: number | null;
  coverImageUrl: string;
  format: string;
}

export function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { totalQuantity, openDrawer } = useCart();

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/books?q=${encodeURIComponent(trimmed)}&limit=5`
        );
        if (res.ok) {
          const data = (await res.json()) as { books: SearchHit[] };
          setHits(data.books);
          setShowDropdown(true);
        }
      } finally {
        setSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    const trimmed = query.trim();
    router.push(trimmed ? `/books?q=${encodeURIComponent(trimmed)}` : "/books");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-glass)] bg-[var(--surface-glass-strong)] backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-md shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="font-editorial block text-lg font-semibold leading-none tracking-tight text-[var(--text-primary)]">
              Folio &amp; Spine
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] sm:block">
              New-Age Bookshop
            </span>
          </div>
        </Link>

        {/* Instant Search */}
        <div ref={searchBoxRef} className="relative hidden max-w-md flex-1 md:block">
          <form onSubmit={handleSearchSubmit}>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                const next = e.target.value;
                setQuery(next);
                if (next.trim().length < 2) {
                  setHits([]);
                  setShowDropdown(false);
                }
              }}
              onFocus={() => hits.length > 0 && setShowDropdown(true)}
              placeholder="Search title, author, ISBN, or publisher..."
              className="h-10 w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface-glass)] pl-10 pr-9 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] backdrop-blur-md transition-all focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setHits([]);
                  setShowDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {showDropdown && (
            <div className="glass-panel-strong absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl">
              {searching ? (
                <div className="px-4 py-3 text-xs text-[var(--text-muted)]">
                  Searching shelves...
                </div>
              ) : hits.length === 0 ? (
                <div className="px-4 py-3 text-xs text-[var(--text-muted)]">
                  No books matched &ldquo;{query}&rdquo;.
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border-glass)]">
                  {hits.map((hit) => (
                    <li key={hit.id}>
                      <Link
                        href={`/books/${hit.slug}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--accent-soft)]"
                      >
                        <img
                          src={hit.coverImageUrl}
                          alt={hit.title}
                          className="h-12 w-8 shrink-0 rounded-md object-cover shadow-xs"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {hit.title}
                          </p>
                          <p className="truncate text-xs text-[var(--text-muted)]">
                            {hit.author} &middot; {hit.format}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-[var(--accent)]">
                          {formatPrice(getEffectiveUnitPrice(hit))}
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={`/books?q=${encodeURIComponent(query.trim())}`}
                      onClick={() => setShowDropdown(false)}
                      className="block bg-[var(--surface-subtle)] px-4 py-2 text-center text-xs font-medium text-[var(--accent)] hover:underline"
                    >
                      View all results for &ldquo;{query.trim()}&rdquo;
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-1.5 sm:gap-2.5">
          <Link
            href="/books"
            className="rounded-xl px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
          >
            Catalog
          </Link>

          <ThemeToggle />

          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition-all hover:scale-[1.02]"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {session?.user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {session.user.name?.split(" ")[0] || "Account"}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-xl p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          <button
            type="button"
            onClick={openDrawer}
            className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.03] hover:shadow-indigo-500/40 active:scale-95 cursor-pointer"
            aria-label="Open shopping bag"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Bag</span>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[11px] font-bold text-white backdrop-blur-xs">
              {totalQuantity}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
