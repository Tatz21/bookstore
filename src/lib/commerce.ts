import type { BookFormat } from "./validators";

export interface PricedBookInput {
  price: number;
  discountPrice?: number | null;
  weightGrams: number;
  format: BookFormat | string;
}

export interface CartLineInput {
  book: PricedBookInput;
  quantity: number;
}

export interface CouponInput {
  code: string;
  discountType: string; // "PERCENT" | "FIXED"
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
}

export function getEffectiveUnitPrice(book: Pick<PricedBookInput, "price" | "discountPrice">): number {
  if (
    book.discountPrice != null &&
    book.discountPrice > 0 &&
    book.discountPrice < book.price
  ) {
    return roundCurrency(book.discountPrice);
  }
  return roundCurrency(book.price);
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateSubtotal(lines: CartLineInput[]): number {
  const total = lines.reduce(
    (sum, line) => sum + getEffectiveUnitPrice(line.book) * line.quantity,
    0
  );
  return roundCurrency(total);
}

export function calculateTotalPhysicalWeightGrams(lines: CartLineInput[]): number {
  return lines.reduce((sum, line) => {
    if (line.book.format === "EBOOK") return sum;
    return sum + Math.max(0, line.book.weightGrams) * line.quantity;
  }, 0);
}

/**
 * Dynamic shipping rate based on physical weight and destination postal code.
 * - Digital-only orders (0g physical weight): free shipping.
 * - Orders >= 999 (in store currency) qualify for free standard shipping.
 * - Base rate 49 + 20 per additional 500g slab, with +20 remote zone surcharge for 79xxxx/68xxxx/9xxxx prefixes.
 */
export function calculateShippingCost(params: {
  lines: CartLineInput[];
  subtotalAfterDiscount: number;
  postalCode?: string;
}): number {
  const physicalWeight = calculateTotalPhysicalWeightGrams(params.lines);
  if (physicalWeight === 0) {
    return 0;
  }
  if (params.subtotalAfterDiscount >= 999) {
    return 0;
  }

  const slabs = Math.max(1, Math.ceil(physicalWeight / 500));
  let rate = 49 + (slabs - 1) * 20;

  const pin = (params.postalCode || "").trim();
  if (/^(79|68|9)/.test(pin)) {
    rate += 20;
  }

  return roundCurrency(rate);
}

export function evaluateCoupon(
  coupon: CouponInput | null,
  subtotal: number,
  now: Date = new Date()
): { valid: boolean; discountAmount: number; reason?: string } {
  if (!coupon) {
    return { valid: false, discountAmount: 0, reason: "Coupon not found" };
  }
  if (!coupon.isActive) {
    return { valid: false, discountAmount: 0, reason: "Coupon is inactive" };
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < now.getTime()) {
    return { valid: false, discountAmount: 0, reason: "Coupon has expired" };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return {
      valid: false,
      discountAmount: 0,
      reason: "Coupon usage limit reached",
    };
  }
  if (subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discountAmount: 0,
      reason: `Minimum order amount of ${coupon.minOrderAmount} required`,
    };
  }

  let discount = 0;
  if (coupon.discountType === "PERCENT") {
    discount = (subtotal * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  discount = roundCurrency(Math.min(subtotal, Math.max(0, discount)));
  return { valid: true, discountAmount: discount };
}
