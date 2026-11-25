"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  CreditCard,
  Download,
  Lock,
  Smartphone,
  Building,
  Tag,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import {
  calculateShippingCost,
  getEffectiveUnitPrice,
  roundCurrency,
} from "@/lib/commerce";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface PendingPayment {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  provider: string;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, subtotal, clearCart } = useCart();

  const [guestEmail, setGuestEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "upi" | "card" | "netbanking"
  >("upi");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    orderNumber: string;
    totalAmount: number;
  } | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/addresses")
      .then((r) => (r.ok ? r.json() : { addresses: [] }))
      .then((data: { addresses?: SavedAddress[] }) => {
        const list = data.addresses || [];
        setSavedAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) {
          setFullName(def.fullName);
          setPhone(def.phone);
          setLine1(def.line1);
          setLine2(def.line2 || "");
          setCity(def.city);
          setState(def.state);
          setPostalCode(def.postalCode);
          setCountry(def.country);
        }
      })
      .catch(() => {});
  }, [session?.user?.id]);

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const subtotalAfterDiscount = roundCurrency(
    Math.max(0, subtotal - discountAmount)
  );
  const shippingAmount = calculateShippingCost({
    lines: items.map((i) => ({ book: i.book, quantity: i.quantity })),
    subtotalAfterDiscount,
    postalCode,
  });
  const totalAmount = roundCurrency(subtotalAfterDiscount + shippingAmount);

  const handleApplyCoupon = async () => {
    setCouponError(null);
    if (!couponInput.trim()) return;
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput.trim(), subtotal }),
    });
    const data = (await res.json()) as {
      valid?: boolean;
      code?: string;
      discountAmount?: number;
      error?: string;
    };
    if (!res.ok || !data.valid) {
      setAppliedCoupon(null);
      setCouponError(data.error || "Invalid coupon code");
      return;
    }
    setAppliedCoupon({
      code: data.code!,
      discountAmount: data.discountAmount!,
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (items.length === 0) {
      setErrorMsg("Your bag is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            bookId: i.bookId,
            quantity: i.quantity,
          })),
          guestEmail: session?.user ? null : guestEmail,
          couponCode: appliedCoupon?.code || null,
          shippingAddress: {
            fullName,
            phone,
            line1,
            line2,
            city,
            state,
            postalCode,
            country,
          },
        }),
      });
      const data = (await res.json()) as {
        orderId?: string;
        orderNumber?: string;
        totalAmount?: number;
        payment?: { provider: string };
        error?: string;
      };
      if (!res.ok || !data.orderId) {
        setErrorMsg(data.error || "Unable to create order");
        return;
      }

      setPendingPayment({
        orderId: data.orderId,
        orderNumber: data.orderNumber!,
        totalAmount: data.totalAmount!,
        provider: data.payment?.provider || "mock",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSandboxPayment = async () => {
    if (!pendingPayment) return;
    setProcessingPayment(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/checkout/mock-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: pendingPayment.orderId,
          outcome: "succeed",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Payment failed");
        return;
      }

      await clearCart();
      setConfirmedOrder({
        orderId: pendingPayment.orderId,
        orderNumber: pendingPayment.orderNumber,
        totalAmount: pendingPayment.totalAmount,
      });
      setPendingPayment(null);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="glass-panel-strong rounded-3xl p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h1 className="font-editorial mt-4 text-3xl font-semibold text-[var(--text-primary)]">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Thank you for shopping with Folio &amp; Spine. Your order{" "}
            <span className="font-mono font-bold text-[var(--text-primary)]">
              {confirmedOrder.orderNumber}
            </span>{" "}
            is confirmed and inventory has been reserved.
          </p>
          <p className="mt-2 text-lg font-bold text-[var(--accent)]">
            Total Paid: {formatPrice(confirmedOrder.totalAmount)}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={`/api/orders/${confirmedOrder.orderId}/invoice?orderNumber=${encodeURIComponent(
                confirmedOrder.orderNumber
              )}`}
            >
              <Button variant="outline">
                <Download className="h-4 w-4" /> Download PDF Invoice
              </Button>
            </a>
            {session?.user ? (
              <Link href="/account">
                <Button variant="accent">Track Order in Account</Button>
              </Link>
            ) : (
              <Link href="/books">
                <Button variant="accent">Continue Browsing</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-editorial text-3xl font-semibold text-[var(--text-primary)]">
        Checkout
      </h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        {session?.user
          ? `Signed in as ${session.user.email}`
          : "Checking out as guest — or sign in for saved addresses & order history."}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <form
          onSubmit={handleCheckoutSubmit}
          className="glass-panel space-y-6 rounded-3xl p-6 lg:col-span-7"
        >
          {savedAddresses.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Use Saved Address
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => {
                      setFullName(addr.fullName);
                      setPhone(addr.phone);
                      setLine1(addr.line1);
                      setLine2(addr.line2 || "");
                      setCity(addr.city);
                      setState(addr.state);
                      setPostalCode(addr.postalCode);
                      setCountry(addr.country);
                    }}
                    className="rounded-2xl border border-[var(--border-glass)] bg-[var(--surface-subtle)] p-3 text-left text-xs transition-colors hover:border-[var(--accent)] cursor-pointer"
                  >
                    <p className="font-semibold text-[var(--text-primary)]">
                      {addr.fullName}
                    </p>
                    <p className="text-[var(--text-secondary)]">
                      {addr.line1}, {addr.city} {addr.postalCode}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!session?.user && (
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Email for Order Receipt &amp; Tracking *
              </label>
              <Input
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1"
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Full Name *
              </label>
              <Input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Phone Number *
              </label>
              <Input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Address Line 1 *
            </label>
            <Input
              required
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="House / Flat / Street"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Address Line 2 (Optional)
            </label>
            <Input
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              placeholder="Landmark / Apartment"
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                City *
              </label>
              <Input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                State *
              </label>
              <Input
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                PIN / Postal Code *
              </label>
              <Input
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="560038"
                className="mt-1"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={submitting || items.length === 0}
            className="w-full"
          >
            <Lock className="h-4 w-4" />
            {submitting
              ? "Preparing Checkout..."
              : `Continue to Payment (${formatPrice(totalAmount)})`}
          </Button>
        </form>

        {/* Summary */}
        <div className="space-y-4 lg:col-span-5">
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="font-editorial text-xl font-semibold text-[var(--text-primary)]">
              Order Summary ({items.length})
            </h2>
            <ul className="mt-4 divide-y divide-[var(--border-glass)]">
              {items.map((item) => (
                <li
                  key={item.bookId}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--text-primary)]">
                      {item.book.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Qty {item.quantity} &middot; {item.book.format}
                    </p>
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {formatPrice(
                      getEffectiveUnitPrice(item.book) * item.quantity
                    )}
                  </span>
                </li>
              ))}
            </ul>

            {/* Promo code */}
            <div className="mt-4 border-t border-[var(--border-glass)] pt-4">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Promo Code (Try <code className="font-mono">READ10</code>)
              </label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyCoupon}
                >
                  <Tag className="h-4 w-4" /> Apply
                </Button>
              </div>
              {couponError && (
                <p className="mt-1 text-xs text-red-500">{couponError}</p>
              )}
              {appliedCoupon && (
                <p className="mt-1 text-xs font-medium text-emerald-500">
                  Applied {appliedCoupon.code}: -
                  {formatPrice(appliedCoupon.discountAmount)}
                </p>
              )}
            </div>

            <div className="mt-4 space-y-2 border-t border-[var(--border-glass)] pt-4 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Shipping (Weight &amp; PIN calculated)</span>
                <span>
                  {shippingAmount === 0 ? "FREE" : formatPrice(shippingAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--border-glass)] pt-3 text-base font-bold text-[var(--text-primary)]">
                <span>Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {pendingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="glass-panel-strong w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-glass)] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                  Secure Payment ({pendingPayment.provider.toUpperCase()})
                </p>
                <h3 className="font-editorial text-xl font-semibold text-[var(--text-primary)]">
                  Order {pendingPayment.orderNumber}
                </h3>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)]">
                {formatPrice(pendingPayment.totalAmount)}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-[var(--text-muted)]">
                Select Payment Method
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "upi" as const, label: "UPI", icon: Smartphone },
                  { id: "card" as const, label: "Card", icon: CreditCard },
                  {
                    id: "netbanking" as const,
                    label: "NetBanking",
                    icon: Building,
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-xs font-medium transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border-glass)] text-[var(--text-secondary)]"
                    }`}
                  >
                    <m.icon className="h-4 w-4" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingPayment(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="accent"
                disabled={processingPayment}
                onClick={handleCompleteSandboxPayment}
                className="flex-1"
              >
                {processingPayment
                  ? "Verifying..."
                  : `Pay ${formatPrice(pendingPayment.totalAmount)}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
