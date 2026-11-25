import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrencyConfig() {
  const code = (process.env.NEXT_PUBLIC_CURRENCY || "INR").toUpperCase();
  if (code === "USD") {
    return { code: "USD", locale: "en-US", symbol: "$" };
  }
  return { code: "INR", locale: "en-IN", symbol: "₹" };
}

export function formatPrice(amount: number | string): string {
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  const safeValue = Number.isFinite(numeric) ? numeric : 0;
  const { code, locale } = getCurrencyConfig();
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: safeValue % 1 === 0 ? 0 : 2,
  }).format(safeValue);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `FS-${y}${m}${d}-${rand}`;
}
