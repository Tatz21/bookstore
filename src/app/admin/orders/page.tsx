"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Printer, Save, Download } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/validators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminOrderRow {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  trackingNumber: string | null;
  shippingAddress: string;
  guestEmail: string | null;
  createdAt: string;
  user: { name: string | null; email: string } | null;
  items: Array<{
    id: string;
    quantity: number;
    priceAtPurchase: number;
    book: { title: string; format: string };
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [drafts, setDrafts] = useState<
    Record<string, { status: string; trackingNumber: string }>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const applyOrders = (list: AdminOrderRow[]) => {
    setOrders(list);
    const nextDrafts: Record<
      string,
      { status: string; trackingNumber: string }
    > = {};
    for (const o of list) {
      nextDrafts[o.id] = {
        status: o.status,
        trackingNumber: o.trackingNumber || "",
      };
    }
    setDrafts(nextDrafts);
  };

  const loadOrders = useCallback(async () => {
    const params = statusFilter ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/orders${params}`);
    if (res.ok) {
      const data = (await res.json()) as { orders: AdminOrderRow[] };
      applyOrders(data.orders);
    }
  }, [statusFilter]);

  useEffect(() => {
    let active = true;
    const params = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/admin/orders${params}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { orders: AdminOrderRow[] } | null) => {
        if (active && data?.orders) applyOrders(data.orders);
      });
    return () => {
      active = false;
    };
  }, [statusFilter]);

  const handleSaveOrder = async (orderId: string) => {
    const draft = drafts[orderId];
    if (!draft) return;
    setSavingId(orderId);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      await loadOrders();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-semibold text-[var(--text-primary)]">
            Order Fulfillment
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Update order statuses, assign tracking numbers, and download
            invoices.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)]"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center text-sm text-[var(--text-muted)]">
            No orders match this status filter.
          </div>
        ) : (
          orders.map((order) => {
            const addr = JSON.parse(order.shippingAddress) as {
              fullName?: string;
              city?: string;
              state?: string;
              postalCode?: string;
              phone?: string;
            };
            const draft = drafts[order.id] || {
              status: order.status,
              trackingNumber: order.trackingNumber || "",
            };

            return (
              <div key={order.id} className="glass-panel rounded-3xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-glass)] pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
                        {order.orderNumber}
                      </span>
                      <Badge
                        variant={
                          order.status === "DELIVERED"
                            ? "success"
                            : order.status === "CANCELLED"
                            ? "danger"
                            : "accent"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {order.user?.name || addr.fullName} (
                      {order.user?.email || order.guestEmail}) &middot;{" "}
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[var(--text-primary)]">
                      {formatPrice(order.totalAmount)}
                    </span>
                    <a href={`/api/orders/${order.id}/invoice`}>
                      <Button size="sm" variant="outline">
                        <Download className="h-3.5 w-3.5" /> Invoice
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.print()}
                    >
                      <Printer className="h-3.5 w-3.5" /> Label
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-12">
                  <ul className="space-y-1 text-xs text-[var(--text-secondary)] lg:col-span-6">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {item.quantity}x
                        </span>{" "}
                        {item.book.title} ({item.book.format}) &mdash;{" "}
                        {formatPrice(item.priceAtPurchase)}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center gap-2 lg:col-span-6 lg:justify-end">
                    <select
                      value={draft.status}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [order.id]: { ...draft, status: e.target.value },
                        }))
                      }
                      className="h-9 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-2.5 text-xs font-medium text-[var(--text-primary)]"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <Input
                      value={draft.trackingNumber}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [order.id]: {
                            ...draft,
                            trackingNumber: e.target.value,
                          },
                        }))
                      }
                      placeholder="Tracking ID..."
                      className="h-9 w-44 text-xs"
                    />

                    <Button
                      size="sm"
                      variant="accent"
                      disabled={savingId === order.id}
                      onClick={() => handleSaveOrder(order.id)}
                    >
                      <Save className="h-3.5 w-3.5" />
                      {savingId === order.id ? "Saving..." : "Update"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
