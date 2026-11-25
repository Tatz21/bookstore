"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { getEffectiveUnitPrice } from "@/lib/commerce";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-editorial text-3xl font-semibold text-[var(--text-primary)]">
        Your Shopping Bag
      </h1>

      {items.length === 0 ? (
        <div className="glass-panel mt-8 rounded-3xl p-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
          <p className="font-editorial mt-3 text-xl font-medium text-[var(--text-primary)]">
            Nothing in your bag yet
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Browse our catalog to add books to your reading list.
          </p>
          <Link href="/books" className="mt-5 inline-block">
            <Button variant="accent">Browse Books</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {items.map((item) => {
              const unitPrice = getEffectiveUnitPrice(item.book);
              return (
                <div
                  key={item.bookId}
                  className="glass-panel flex items-center gap-4 rounded-2xl p-4"
                >
                  <img
                    src={item.book.coverImageUrl}
                    alt={item.book.title}
                    className="h-24 w-16 rounded-xl object-cover shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/books/${item.book.slug}`}
                      className="font-editorial text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                    >
                      {item.book.title}
                    </Link>
                    <p className="text-xs text-[var(--text-muted)]">
                      {item.book.author} &middot; {item.book.format}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--accent)]">
                      {formatPrice(unitPrice)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface-subtle)]">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.bookId, item.quantity - 1)
                        }
                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 text-sm font-semibold text-[var(--text-primary)]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.bookId, item.quantity + 1)
                        }
                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.bookId)}
                      className="rounded-xl p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-4">
            <div className="glass-panel rounded-3xl p-6">
              <h2 className="font-editorial text-xl font-semibold text-[var(--text-primary)]">
                Order Summary
              </h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <Link href="/checkout" className="mt-6 block">
                <Button variant="accent" size="lg" className="w-full">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
