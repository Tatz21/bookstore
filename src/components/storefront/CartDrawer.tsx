"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { getEffectiveUnitPrice } from "@/lib/commerce";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const {
    items,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCart();

  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isDrawerOpen || !drawerRef.current) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        drawerRef.current,
        { x: "100%", opacity: 0.6 },
        { x: "0%", opacity: 1, duration: 0.35, ease: "power3.out" }
      );
    });
    return () => mm.revert();
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const freeShippingThreshold = 999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      <aside
        ref={drawerRef}
        className="glass-panel-strong relative z-10 flex h-full w-full max-w-md flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-glass)] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <h2 className="font-editorial text-xl font-semibold text-[var(--text-primary)]">
              Your Reading Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-xl p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Close bag"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="border-b border-[var(--border-glass)] bg-[var(--surface-subtle)]/70 px-6 py-3">
          <p className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            {remainingForFreeShipping === 0
              ? "You unlocked FREE express shipping!"
              : `Add ${formatPrice(remainingForFreeShipping)} more for free shipping`}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-glass)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <p className="font-editorial mt-4 text-xl font-medium text-[var(--text-primary)]">
                Your bag is empty
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Explore our shelves to find your next great read.
              </p>
              <Link href="/books" onClick={closeDrawer} className="mt-6">
                <Button variant="accent">Browse Catalog</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const unitPrice = getEffectiveUnitPrice(item.book);
                return (
                  <li
                    key={item.bookId}
                    className="flex gap-4 rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-elevated)]/80 p-3 backdrop-blur-xs transition-all hover:border-[var(--accent)]/40"
                  >
                    <Link
                      href={`/books/${item.book.slug}`}
                      onClick={closeDrawer}
                      className="shrink-0"
                    >
                      <img
                        src={item.book.coverImageUrl}
                        alt={item.book.title}
                        className="h-24 w-16 rounded-lg object-cover shadow-md"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <Link
                          href={`/books/${item.book.slug}`}
                          onClick={closeDrawer}
                          className="line-clamp-1 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          {item.book.title}
                        </Link>
                        <p className="text-xs text-[var(--text-muted)]">
                          {item.book.author} &middot; {item.book.format}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface-subtle)]">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.bookId, item.quantity - 1)
                            }
                            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-[var(--text-primary)]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.bookId, item.quantity + 1)
                            }
                            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[var(--text-primary)]">
                            {formatPrice(unitPrice * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.bookId)}
                            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[var(--border-glass)] bg-[var(--surface-subtle)]/70 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Subtotal</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Shipping and promo codes calculated at checkout.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Link href="/cart" onClick={closeDrawer}>
                <Button variant="outline" className="w-full">
                  View Bag
                </Button>
              </Link>
              <Link href="/checkout" onClick={closeDrawer}>
                <Button variant="accent" className="w-full">
                  Checkout <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
