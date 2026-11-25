"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Package,
  Download,
  Heart,
  MapPin,
  Plus,
  Trash2,
  Truck,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OrderRecord {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  trackingNumber: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    priceAtPurchase: number;
    book: {
      id: string;
      title: string;
      slug: string;
      author: string;
      coverImageUrl: string;
      format: string;
    };
  }>;
}

interface WishlistEntry {
  id: string;
  bookId: string;
  book: {
    id: string;
    title: string;
    slug: string;
    author: string;
    price: number;
    discountPrice: number | null;
    coverImageUrl: string;
  };
}

interface AddressEntry {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const STEPS = ["PENDING", "PAID", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default function AccountPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
  const [addresses, setAddresses] = useState<AddressEntry[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const loadData = async () => {
    const [oRes, wRes, aRes] = await Promise.all([
      fetch("/api/orders"),
      fetch("/api/wishlist"),
      fetch("/api/addresses"),
    ]);
    if (oRes.ok) {
      const o = (await oRes.json()) as { orders: OrderRecord[] };
      setOrders(o.orders);
    }
    if (wRes.ok) {
      const w = (await wRes.json()) as { items: WishlistEntry[] };
      setWishlist(w.items);
    }
    if (aRes.ok) {
      const a = (await aRes.json()) as { addresses: AddressEntry[] };
      setAddresses(a.addresses);
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    let active = true;
    Promise.all([
      fetch("/api/orders"),
      fetch("/api/wishlist"),
      fetch("/api/addresses"),
    ]).then(async ([oRes, wRes, aRes]) => {
      if (!active) return;
      if (oRes.ok) {
        const o = (await oRes.json()) as { orders: OrderRecord[] };
        setOrders(o.orders);
      }
      if (wRes.ok) {
        const w = (await wRes.json()) as { items: WishlistEntry[] };
        setWishlist(w.items);
      }
      if (aRes.ok) {
        const a = (await aRes.json()) as { addresses: AddressEntry[] };
        setAddresses(a.addresses);
      }
    });
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        phone,
        line1,
        city,
        state,
        postalCode,
        country: "India",
      }),
    });
    if (res.ok) {
      setShowAddressForm(false);
      setFullName("");
      setPhone("");
      setLine1("");
      setCity("");
      setState("");
      setPostalCode("");
      loadData();
    }
  };

  const handleDeleteAddress = async (id: string) => {
    await fetch(`/api/addresses?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    loadData();
  };

  const handleRemoveWishlist = async (bookId: string) => {
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });
    loadData();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-[var(--border-glass)] pb-5">
        <h1 className="font-editorial text-3xl font-semibold text-[var(--text-primary)]">
          Reader Account
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {session?.user?.name} &middot; {session?.user?.email}
        </p>
      </div>

      {/* Orders */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-[var(--accent)]" />
          <h2 className="font-editorial text-2xl font-semibold text-[var(--text-primary)]">
            Order History
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center text-sm text-[var(--text-muted)]">
            You haven&rsquo;t placed any orders yet.{" "}
            <Link
              href="/books"
              className="font-semibold text-[var(--accent)] underline"
            >
              Browse the catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const currentStep = STEPS.indexOf(order.status);
              return (
                <div key={order.id} className="glass-panel rounded-3xl p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-glass)] pb-4">
                    <div>
                      <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
                        {order.orderNumber}
                      </span>
                      <span className="ml-3 text-xs text-[var(--text-muted)]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          order.status === "CANCELLED"
                            ? "danger"
                            : order.status === "DELIVERED"
                            ? "success"
                            : "accent"
                        }
                      >
                        {order.status}
                      </Badge>
                      <span className="font-bold text-[var(--text-primary)]">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <a href={`/api/orders/${order.id}/invoice`}>
                        <Button size="sm" variant="outline">
                          <Download className="h-3.5 w-3.5" /> Invoice
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* Visual progress timeline */}
                  {order.status !== "CANCELLED" && (
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {STEPS.map((step, idx) => (
                        <div key={step} className="text-center">
                          <div
                            className={`h-1.5 rounded-full transition-colors ${
                              idx <= currentStep
                                ? "bg-gradient-to-r from-indigo-500 to-violet-500"
                                : "bg-[var(--border-glass)]"
                            }`}
                          />
                          <span className="mt-1 block text-[10px] font-medium text-[var(--text-muted)]">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {order.trackingNumber && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      <Truck className="h-3.5 w-3.5 text-[var(--accent)]" />
                      Tracking Number:{" "}
                      <span className="font-mono font-semibold text-[var(--text-primary)]">
                        {order.trackingNumber}
                      </span>
                    </p>
                  )}

                  <ul className="mt-4 divide-y divide-[var(--border-glass)]">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between py-2.5 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.book.coverImageUrl}
                            alt={item.book.title}
                            className="h-12 w-9 rounded-md object-cover"
                          />
                          <div>
                            <Link
                              href={`/books/${item.book.slug}`}
                              className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)]"
                            >
                              {item.book.title}
                            </Link>
                            <p className="text-xs text-[var(--text-muted)]">
                              Qty {item.quantity} &middot; {item.book.format}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">
                          {formatPrice(item.priceAtPurchase * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Wishlist & Saved Addresses */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="font-editorial text-2xl font-semibold text-[var(--text-primary)]">
              Saved Wishlist
            </h2>
          </div>
          {wishlist.length === 0 ? (
            <div className="glass-panel rounded-2xl p-6 text-sm text-[var(--text-muted)]">
              No saved books yet.
            </div>
          ) : (
            <div className="space-y-3">
              {wishlist.map((w) => (
                <div
                  key={w.id}
                  className="glass-panel flex items-center justify-between rounded-2xl p-4"
                >
                  <Link
                    href={`/books/${w.book.slug}`}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={w.book.coverImageUrl}
                      alt={w.book.title}
                      className="h-14 w-10 rounded-md object-cover"
                    />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {w.book.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {w.book.author} &middot;{" "}
                        {formatPrice(w.book.discountPrice ?? w.book.price)}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemoveWishlist(w.bookId)}
                    className="rounded-lg p-2 text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="font-editorial text-2xl font-semibold text-[var(--text-primary)]">
                Saved Addresses
              </h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddressForm((v) => !v)}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>

          {showAddressForm && (
            <form
              onSubmit={handleAddAddress}
              className="glass-panel space-y-3 rounded-2xl p-4"
            >
              <div className="grid grid-cols-2 gap-2">
                <Input
                  required
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Input
                  required
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Input
                required
                placeholder="Street Address"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input
                  required
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
                <Input
                  required
                  placeholder="PIN"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
              <Button type="submit" size="sm" variant="accent">
                Save Address
              </Button>
            </form>
          )}

          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="glass-panel flex items-start justify-between rounded-2xl p-4 text-sm"
              >
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {addr.fullName}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {addr.phone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="rounded-lg p-1.5 text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
