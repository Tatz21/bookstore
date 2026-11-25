"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ImageUploader } from "./ImageUploader";

interface CategoryOption {
  id: string;
  name: string;
}

export interface BookFormInitial {
  id?: string;
  title: string;
  author: string;
  authorBio: string;
  isbn10: string;
  isbn13: string;
  description: string;
  price: string;
  discountPrice: string;
  stockQuantity: string;
  weightGrams: string;
  coverImageUrl: string;
  format: "PAPERBACK" | "HARDCOVER" | "EBOOK";
  language: string;
  pages: string;
  publisher: string;
  publishedDate: string;
  categoryId: string;
  isFeatured: boolean;
}

export function BookForm({
  categories,
  initial,
}: {
  categories: CategoryOption[];
  initial?: BookFormInitial;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [isbnQuery, setIsbnQuery] = useState(
    initial?.isbn13 || initial?.isbn10 || ""
  );
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupFeedback, setLookupFeedback] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title || "");
  const [author, setAuthor] = useState(initial?.author || "");
  const [authorBio, setAuthorBio] = useState(initial?.authorBio || "");
  const [isbn10, setIsbn10] = useState(initial?.isbn10 || "");
  const [isbn13, setIsbn13] = useState(initial?.isbn13 || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial?.price || "");
  const [discountPrice, setDiscountPrice] = useState(
    initial?.discountPrice || ""
  );
  const [stockQuantity, setStockQuantity] = useState(
    initial?.stockQuantity || "10"
  );
  const [weightGrams, setWeightGrams] = useState(
    initial?.weightGrams || "350"
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    initial?.coverImageUrl || ""
  );
  const [format, setFormat] = useState<"PAPERBACK" | "HARDCOVER" | "EBOOK">(
    initial?.format || "PAPERBACK"
  );
  const [language, setLanguage] = useState(initial?.language || "English");
  const [pages, setPages] = useState(initial?.pages || "");
  const [publisher, setPublisher] = useState(initial?.publisher || "");
  const [publishedDate, setPublishedDate] = useState(
    initial?.publishedDate || ""
  );
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId || categories[0]?.id || ""
  );
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleIsbnAutoFill = async () => {
    if (!isbnQuery.trim()) return;
    setLookingUp(true);
    setLookupFeedback(null);
    try {
      const res = await fetch(
        `/api/admin/isbn?isbn=${encodeURIComponent(isbnQuery.trim())}`
      );
      const data = (await res.json()) as {
        metadata?: {
          title: string;
          author: string;
          description: string;
          isbn10: string | null;
          isbn13: string | null;
          pages: number | null;
          publisher: string | null;
          publishedDate: string | null;
          language: string;
          coverImageUrl: string | null;
          source: string;
        };
        error?: string;
      };

      if (!res.ok || !data.metadata) {
        setLookupFeedback(
          data.error || "ISBN not found in Google Books or OpenLibrary."
        );
        return;
      }

      const m = data.metadata;
      setTitle(m.title);
      setAuthor(m.author);
      setDescription(m.description);
      if (m.isbn10) setIsbn10(m.isbn10);
      if (m.isbn13) setIsbn13(m.isbn13);
      if (m.pages) setPages(String(m.pages));
      if (m.publisher) setPublisher(m.publisher);
      if (m.publishedDate) setPublishedDate(m.publishedDate);
      if (m.language) setLanguage(m.language);
      if (m.coverImageUrl) setCoverImageUrl(m.coverImageUrl);
      setLookupFeedback(
        `Auto-filled metadata from ${m.source.replace("_", " ")}`
      );
    } finally {
      setLookingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        title,
        author,
        authorBio: authorBio || null,
        isbn10: isbn10 || null,
        isbn13: isbn13 || null,
        description,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stockQuantity: Number(stockQuantity),
        weightGrams: format === "EBOOK" ? 0 : Number(weightGrams),
        coverImageUrl,
        format,
        language,
        pages: pages ? Number(pages) : null,
        publisher: publisher || null,
        publishedDate: publishedDate || null,
        categoryId,
        isFeatured,
      };

      const url = isEdit
        ? `/api/admin/books/${initial!.id}`
        : "/api/admin/books";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to save book");
        return;
      }

      router.push("/admin/books");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const selectClass =
    "mt-1 h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)]";

  return (
    <div className="space-y-6">
      {/* Smart ISBN Auto-Fill Card */}
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
          <span>Smart ISBN Auto-Fill</span>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Enter an ISBN-10 or ISBN-13 (e.g.,{" "}
          <code className="font-mono">9780143127741</code>) to auto-populate
          metadata and cover art via Google Books &amp; OpenLibrary.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            value={isbnQuery}
            onChange={(e) => setIsbnQuery(e.target.value)}
            placeholder="9780143127741"
            className="max-w-xs"
          />
          <Button
            type="button"
            variant="accent"
            disabled={lookingUp}
            onClick={handleIsbnAutoFill}
          >
            {lookingUp ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Fetching...
              </>
            ) : (
              "Auto-Fill Details"
            )}
          </Button>
        </div>
        {lookupFeedback && (
          <p className="mt-2 text-xs font-medium text-[var(--accent)]">
            {lookupFeedback}
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-panel space-y-6 rounded-3xl p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Book Title *
            </label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Author(s) *
            </label>
            <Input
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Category / Genre *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={selectClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Format *
            </label>
            <select
              value={format}
              onChange={(e) =>
                setFormat(
                  e.target.value as "PAPERBACK" | "HARDCOVER" | "EBOOK"
                )
              }
              className={selectClass}
            >
              <option value="PAPERBACK">Paperback</option>
              <option value="HARDCOVER">Hardcover</option>
              <option value="EBOOK">E-Book</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Language *
            </label>
            <Input
              required
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Regular Price *
            </label>
            <Input
              type="number"
              step="0.01"
              min="1"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Discount Price
            </label>
            <Input
              type="number"
              step="0.01"
              min="1"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Stock Quantity *
            </label>
            <Input
              type="number"
              min="0"
              required
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Weight (grams)
            </label>
            <Input
              type="number"
              min="0"
              disabled={format === "EBOOK"}
              value={format === "EBOOK" ? "0" : weightGrams}
              onChange={(e) => setWeightGrams(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-5">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              ISBN-13
            </label>
            <Input
              value={isbn13}
              onChange={(e) => setIsbn13(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              ISBN-10
            </label>
            <Input
              value={isbn10}
              onChange={(e) => setIsbn10(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Pages
            </label>
            <Input
              type="number"
              min="1"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Publisher
            </label>
            <Input
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Published Date
            </label>
            <Input
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              placeholder="2024-05-01"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">
            Synopsis / Description *
          </label>
          <Textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 min-h-[120px]"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">
            Author Bio (Optional)
          </label>
          <Textarea
            value={authorBio}
            onChange={(e) => setAuthorBio(e.target.value)}
            className="mt-1 min-h-[70px]"
          />
        </div>

        <ImageUploader value={coverImageUrl} onChange={setCoverImageUrl} />

        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 accent-indigo-600"
          />
          Feature this book on the Storefront Homepage
        </label>

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/books")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="accent" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving
              ? "Saving..."
              : isEdit
              ? "Update Book"
              : "Publish Book to Store"}
          </Button>
        </div>
      </form>
    </div>
  );
}
