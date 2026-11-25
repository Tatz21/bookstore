import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--border-glass)] bg-[var(--surface-glass)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="font-editorial text-lg font-semibold text-[var(--text-primary)]">
              Folio &amp; Spine
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            Curated hardcover, paperback, and digital editions crafted for
            modern readers in light or midnight mode.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Browse
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
            <li>
              <Link href="/books" className="hover:text-[var(--accent)]">
                All Books
              </Link>
            </li>
            <li>
              <Link
                href="/books?sort=bestsellers"
                className="hover:text-[var(--accent)]"
              >
                Bestsellers
              </Link>
            </li>
            <li>
              <Link
                href="/books?format=HARDCOVER"
                className="hover:text-[var(--accent)]"
              >
                Hardcover Editions
              </Link>
            </li>
            <li>
              <Link
                href="/books?format=EBOOK"
                className="hover:text-[var(--accent)]"
              >
                Digital E-Books
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Reader Services
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
            <li>
              <Link href="/account" className="hover:text-[var(--accent)]">
                Order Tracking &amp; Invoices
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-[var(--accent)]">
                Shopping Bag
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-[var(--accent)]">
                Sign In / Register
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Store Operations
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
            <li>
              <Link href="/admin" className="hover:text-[var(--accent)]">
                Admin Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/books/new" className="hover:text-[var(--accent)]">
                Upload Book (ISBN Auto-Fill)
              </Link>
            </li>
            <li>
              <span className="text-xs text-[var(--text-muted)]">
                Promo codes: <code className="font-mono">READ10</code> &middot;{" "}
                <code className="font-mono">WELCOME150</code>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border-glass)] py-5 text-center text-xs text-[var(--text-muted)]">
        &copy; {new Date().getFullYear()} Folio &amp; Spine Bookshop. Next.js,
        Prisma &amp; GSAP.
      </div>
    </footer>
  );
}
