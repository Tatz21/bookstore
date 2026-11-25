"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookCopy,
  PlusCircle,
  FileSpreadsheet,
  PackageCheck,
  Store,
  BookOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/books", label: "Inventory", icon: BookCopy },
  { href: "/admin/books/new", label: "Add Book", icon: PlusCircle },
  { href: "/admin/books/import", label: "Bulk CSV Import", icon: FileSpreadsheet },
  { href: "/admin/orders", label: "Orders", icon: PackageCheck },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="glass-panel-strong flex w-full flex-col border-b border-[var(--border-glass)] lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between border-b border-[var(--border-glass)] px-5 py-4">
        <Link href="/admin" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-md shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <span className="font-editorial block text-base font-semibold leading-none text-[var(--text-primary)]">
              Folio &amp; Spine
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Admin Console
            </span>
          </div>
        </Link>
        <ThemeToggle compact />
      </div>

      <nav className="flex flex-1 gap-1.5 overflow-x-auto p-3 lg:flex-col">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href ||
                (item.href !== "/admin/books" &&
                  pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-[var(--border-glass)] p-4 lg:block">
        <p className="truncate text-xs text-[var(--text-muted)]">{userEmail}</p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
        >
          <Store className="h-3.5 w-3.5" /> View Live Storefront
        </Link>
      </div>
    </aside>
  );
}
