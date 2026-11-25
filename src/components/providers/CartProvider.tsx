"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { getEffectiveUnitPrice } from "@/lib/commerce";

export interface CartBook {
  id: string;
  title: string;
  slug: string;
  author: string;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
  weightGrams: number;
  format: string;
  coverImageUrl: string;
}

export interface CartLineItem {
  bookId: string;
  quantity: number;
  book: CartBook;
}

interface CartContextValue {
  items: CartLineItem[];
  totalQuantity: number;
  subtotal: number;
  isDrawerOpen: boolean;
  isLoading: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (book: CartBook, quantity?: number) => Promise<void>;
  updateQuantity: (bookId: string, quantity: number) => Promise<void>;
  removeItem: (bookId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const STORAGE_KEY = "folio_spine_guest_cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasMergedGuestCartRef = useRef(false);

  const readGuestCart = (): CartLineItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLineItem[]) : [];
    } catch {
      return [];
    }
  };

  const writeGuestCart = (next: CartLineItem[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const refreshCart = useCallback(async () => {
    if (status === "loading") return;
    if (session?.user?.id) {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = (await res.json()) as {
            items: Array<{ bookId: string; quantity: number; book: CartBook }>;
          };
          setItems(
            data.items.map((i) => ({
              bookId: i.bookId,
              quantity: i.quantity,
              book: i.book,
            }))
          );
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      const guest = readGuestCart();
      await Promise.resolve();
      setItems(guest);
    }
  }, [session?.user?.id, status]);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.id && !hasMergedGuestCartRef.current) {
      hasMergedGuestCartRef.current = true;
      const guestItems = readGuestCart();
      if (guestItems.length > 0) {
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: guestItems.map((g) => ({
              bookId: g.bookId,
              quantity: g.quantity,
            })),
          }),
        })
          .then((r) => r.json())
          .then((data: { items?: CartLineItem[] }) => {
            if (data.items) setItems(data.items);
            localStorage.removeItem(STORAGE_KEY);
          })
          .catch(() => refreshCart());
        return;
      }
    }
    void refreshCart();
  }, [session?.user?.id, status, refreshCart]);

  const addItem = async (book: CartBook, quantity = 1) => {
    if (session?.user?.id) {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, quantity }),
      });
      const data = (await res.json()) as {
        items?: CartLineItem[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Unable to add to bag");
      }
      if (data.items) setItems(data.items);
    } else {
      setItems((prev) => {
        const existing = prev.find((i) => i.bookId === book.id);
        const nextQty = (existing?.quantity ?? 0) + quantity;
        if (book.format !== "EBOOK" && nextQty > book.stockQuantity) {
          throw new Error(`Only ${book.stockQuantity} unit(s) available`);
        }
        const next = existing
          ? prev.map((i) =>
              i.bookId === book.id ? { ...i, quantity: nextQty } : i
            )
          : [...prev, { bookId: book.id, quantity: nextQty, book }];
        writeGuestCart(next);
        return next;
      });
    }
    setIsDrawerOpen(true);
  };

  const updateQuantity = async (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(bookId);
      return;
    }

    if (session?.user?.id) {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, quantity }),
      });
      const data = (await res.json()) as {
        items?: CartLineItem[];
        error?: string;
      };
      if (res.ok && data.items) {
        setItems(data.items);
      }
    } else {
      setItems((prev) => {
        const next = prev.map((i) => {
          if (i.bookId !== bookId) return i;
          const capped =
            i.book.format === "EBOOK"
              ? quantity
              : Math.min(quantity, i.book.stockQuantity);
          return { ...i, quantity: Math.max(1, capped) };
        });
        writeGuestCart(next);
        return next;
      });
    }
  };

  const removeItem = async (bookId: string) => {
    if (session?.user?.id) {
      const res = await fetch(
        `/api/cart?bookId=${encodeURIComponent(bookId)}`,
        { method: "DELETE" }
      );
      const data = (await res.json()) as { items?: CartLineItem[] };
      if (res.ok && data.items) setItems(data.items);
    } else {
      setItems((prev) => {
        const next = prev.filter((i) => i.bookId !== bookId);
        writeGuestCart(next);
        return next;
      });
    }
  };

  const clearCart = async () => {
    if (session?.user?.id) {
      await fetch("/api/cart", { method: "DELETE" });
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setItems([]);
  };

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + getEffectiveUnitPrice(i.book) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalQuantity,
        subtotal,
        isDrawerOpen,
        isLoading,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
