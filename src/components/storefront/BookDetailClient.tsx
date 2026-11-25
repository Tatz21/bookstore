"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, ShoppingBag, Star, Check, AlertCircle } from "lucide-react";
import { useCart, type CartBook } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

export function BookDetailClient({
  book,
  initialWishlisted,
  reviews: initialReviews,
}: {
  book: CartBook & {
    slug: string;
    authorBio: string | null;
  };
  initialWishlisted: boolean;
  reviews: ReviewItem[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCart();

  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [adding, setAdding] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const outOfStock = book.format !== "EBOOK" && book.stockQuantity <= 0;

  const handleAddToCart = async () => {
    setErrorMsg(null);
    setAdding(true);
    try {
      await addItem(book, qty);
      setActionMsg("Added to your reading bag");
      setTimeout(() => setActionMsg(null), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not add to bag");
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/books/${book.slug}`);
      return;
    }
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: book.id }),
    });
    if (res.ok) {
      const data = (await res.json()) as { wishlisted: boolean };
      setWishlisted(data.wishlisted);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingReview(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/books/${book.slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = (await res.json()) as { review?: ReviewItem; error?: string };
      if (!res.ok) {
        setErrorMsg(data.error || "Unable to submit review");
        return;
      }
      if (data.review) {
        setReviews((prev) => {
          const withoutSelf = prev.filter(
            (r) => r.user.id !== data.review!.user.id
          );
          return [data.review!, ...withoutSelf];
        });
        setComment("");
        router.refresh();
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add to Bag & Wishlist Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {!outOfStock && book.format !== "EBOOK" && (
            <div className="inline-flex h-12 items-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-glass)] px-2 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-2.5 text-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-semibold text-[var(--text-primary)]">
                {qty}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQty((q) => Math.min(book.stockQuantity, q + 1))
                }
                className="px-2.5 text-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                +
              </button>
            </div>
          )}

          <Button
            size="lg"
            variant="accent"
            disabled={outOfStock || adding}
            onClick={handleAddToCart}
            className="flex-1 sm:flex-none sm:min-w-[220px]"
          >
            {actionMsg ? (
              <>
                <Check className="h-4 w-4" /> {actionMsg}
              </>
            ) : outOfStock ? (
              "Currently Out of Stock"
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" /> Add to Bag
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleToggleWishlist}
            aria-label="Toggle wishlist"
          >
            <Heart
              className={`h-4 w-4 transition-transform ${
                wishlisted
                  ? "scale-110 fill-rose-500 text-rose-500"
                  : ""
              }`}
            />
            {wishlisted ? "Saved" : "Wishlist"}
          </Button>
        </div>

        {errorMsg && (
          <p className="flex items-center gap-1.5 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" /> {errorMsg}
          </p>
        )}
      </div>

      {/* Author Bio */}
      {book.authorBio && (
        <section className="glass-panel rounded-3xl p-6">
          <h2 className="font-editorial text-xl font-semibold text-[var(--text-primary)]">
            About the Author
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            {book.authorBio}
          </p>
        </section>
      )}

      {/* Customer Reviews */}
      <section className="glass-panel space-y-6 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-2xl font-semibold text-[var(--text-primary)]">
            Reader Reviews ({reviews.length})
          </h2>
        </div>

        {session?.user ? (
          <form
            onSubmit={handleReviewSubmit}
            className="space-y-3 rounded-2xl border border-[var(--border-glass)] bg-[var(--surface-subtle)]/70 p-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Your Rating:
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5 cursor-pointer"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`h-5 w-5 transition-transform hover:scale-110 ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-[var(--text-muted)]"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share what stood out to you about this edition..."
              required
            />
            <Button type="submit" disabled={submittingReview}>
              {submittingReview ? "Publishing..." : "Submit Review"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            <a
              href={`/login?callbackUrl=/books/${book.slug}`}
              className="font-semibold text-[var(--accent)] underline"
            >
              Sign in
            </a>{" "}
            to leave a reader review.
          </p>
        )}

        <div className="divide-y divide-[var(--border-glass)]">
          {reviews.length === 0 ? (
            <p className="py-4 text-sm text-[var(--text-muted)]">
              No reviews yet. Be the first reader to share your thoughts.
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {rev.user.name || "Verified Reader"}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-1 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        s <= rev.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-[var(--border-strong)]"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
