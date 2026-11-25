"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminBookRow {
  id: string;
  title: string;
  slug: string;
  author: string;
  isbn13: string | null;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
  format: string;
  coverImageUrl: string;
  isActive: boolean;
  category: { name: string };
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<AdminBookRow[]>([]);
  const [query, setQuery] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (lowStockOnly) params.set("lowStock", "true");
      const res = await fetch(`/api/admin/books?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { books: AdminBookRow[] };
        setBooks(data.books);
      }
    } finally {
      setLoading(false);
    }
  }, [query, lowStockOnly]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (lowStockOnly) params.set("lowStock", "true");
    fetch(`/api/admin/books?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { books: [] }))
      .then((data: { books: AdminBookRow[] }) => {
        if (active) setBooks(data.books);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query, lowStockOnly]);

  const handleQuickStock = async (id: string, nextStock: number) => {
    await fetch(`/api/admin/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockQuantity: Math.max(0, nextStock) }),
    });
    fetchBooks();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Remove or archive "${title}"?`)) return;
    await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    fetchBooks();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-semibold text-[var(--text-primary)]">
            Book Inventory
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage catalog titles, pricing, and stock levels.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/books/import">
            <Button variant="outline">Bulk CSV</Button>
          </Link>
          <Link href="/admin/books/new">
            <Button variant="accent">
              <Plus className="h-4 w-4" /> Add Book
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title, author, or ISBN..."
            className="pl-9"
          />
        </div>
        <button
          type="button"
          onClick={() => setLowStockOnly((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
            lowStockOnly
              ? "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300"
              : "border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Low Stock (&lt; 5)
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-x-auto rounded-3xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border-glass)] bg-[var(--surface-subtle)]/70 text-xs uppercase tracking-wider text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3.5">Book</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Format</th>
              <th className="px-4 py-3.5">Price</th>
              <th className="px-4 py-3.5">Stock</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-glass)]">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-[var(--text-muted)]"
                >
                  Loading inventory...
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-[var(--text-muted)]"
                >
                  No books found matching your filter.
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr
                  key={book.id}
                  className="transition-colors hover:bg-[var(--accent-soft)]/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        className="h-12 w-8 rounded-md object-cover shadow-xs"
                      />
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">
                          {book.title}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {book.author}
                          {book.isbn13 ? ` · ${book.isbn13}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                    {book.category.name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{book.format}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                    {formatPrice(book.discountPrice ?? book.price)}
                    {book.discountPrice && (
                      <span className="ml-1.5 text-xs text-[var(--text-muted)] line-through">
                        {formatPrice(book.price)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {book.format === "EBOOK" ? (
                      <Badge variant="success">Digital</Badge>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickStock(book.id, book.stockQuantity - 1)
                          }
                          className="h-6 w-6 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-subtle)] text-xs text-[var(--text-primary)] hover:border-[var(--accent)] cursor-pointer"
                        >
                          -
                        </button>
                        <Badge
                          variant={
                            book.stockQuantity === 0
                              ? "danger"
                              : book.stockQuantity < 5
                              ? "warning"
                              : "success"
                          }
                        >
                          {book.stockQuantity}
                        </Badge>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickStock(book.id, book.stockQuantity + 1)
                          }
                          className="h-6 w-6 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-subtle)] text-xs text-[var(--text-primary)] hover:border-[var(--accent)] cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/books/${book.id}/edit`}
                        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                        title="Edit book"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(book.id, book.title)}
                        className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                        title="Delete / Archive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
