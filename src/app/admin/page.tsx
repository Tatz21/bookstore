import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  BookOpen,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  AnimatedNumber,
  StaggerGrid,
} from "@/components/motion/MotionPrimitives";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [orders, lowStockBooks, totalBooks, topOrderItems] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { totalAmount: true, status: true },
    }),
    prisma.book.findMany({
      where: {
        isActive: true,
        format: { not: "EBOOK" },
        stockQuantity: { lt: 5 },
      },
      orderBy: { stockQuantity: "asc" },
    }),
    prisma.book.count({ where: { isActive: true } }),
    prisma.orderItem.groupBy({
      by: ["bookId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const paidRevenue = Math.round(
    orders
      .filter((o) => o.status !== "PENDING")
      .reduce((sum, o) => sum + o.totalAmount, 0)
  );

  const topBookIds = topOrderItems.map((i) => i.bookId);
  const topBooks = await prisma.book.findMany({
    where: { id: { in: topBookIds } },
    select: {
      id: true,
      title: true,
      author: true,
      price: true,
      stockQuantity: true,
    },
  });
  const topMap = new Map(topBooks.map((b) => [b.id, b]));

  const kpis = [
    {
      label: "Total Revenue",
      numeric: paidRevenue,
      prefix: "₹",
      icon: IndianRupee,
      sub: "Confirmed & paid orders",
    },
    {
      label: "Total Orders",
      numeric: orders.length,
      prefix: "",
      icon: ShoppingBag,
      sub: "Excluding cancelled",
    },
    {
      label: "Active Catalog",
      numeric: totalBooks,
      prefix: "",
      icon: BookOpen,
      sub: "Published titles",
    },
    {
      label: "Low-Stock Alerts",
      numeric: lowStockBooks.length,
      prefix: "",
      icon: AlertTriangle,
      sub: "Titles under 5 units",
      highlight: lowStockBooks.length > 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-semibold text-[var(--text-primary)]">
            Store Analytics Overview
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Real-time sales performance, inventory health, and fulfillment queue.
          </p>
        </div>
        <Link href="/admin/books/new">
          <Button variant="accent">+ Upload New Book</Button>
        </Link>
      </div>

      {/* Animated KPI Cards */}
      <StaggerGrid className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="stagger-card glass-panel rounded-2xl p-5 transition-all hover:border-[var(--accent)]/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {kpi.label}
              </span>
              <kpi.icon
                className={`h-4 w-4 ${
                  kpi.highlight ? "text-amber-500" : "text-[var(--accent)]"
                }`}
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
              <AnimatedNumber value={kpi.numeric} prefix={kpi.prefix} />
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{kpi.sub}</p>
          </div>
        ))}
      </StaggerGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-xl font-semibold text-[var(--text-primary)]">
              Low-Stock Notifications (&lt; 5 units)
            </h2>
            <Link
              href="/admin/books?lowStock=true"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Manage <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {lowStockBooks.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              All physical titles are well stocked.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--border-glass)]">
              {lowStockBooks.map((book) => (
                <li
                  key={book.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                    >
                      {book.title}
                    </Link>
                    <p className="text-xs text-[var(--text-muted)]">
                      {book.author}
                    </p>
                  </div>
                  <Badge
                    variant={book.stockQuantity === 0 ? "danger" : "warning"}
                  >
                    {book.stockQuantity === 0
                      ? "Out of Stock"
                      : `${book.stockQuantity} left`}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Top Selling Books */}
        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-xl font-semibold text-[var(--text-primary)]">
              Top-Selling Books
            </h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              View Orders <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {topOrderItems.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              No completed book sales recorded yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--border-glass)]">
              {topOrderItems.map((entry) => {
                const book = topMap.get(entry.bookId);
                if (!book) return null;
                return (
                  <li
                    key={book.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {book.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {book.author}
                      </p>
                    </div>
                    <Badge variant="success">
                      {entry._sum.quantity || 0} sold
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
