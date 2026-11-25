import { describe, expect, it } from "vitest";
import {
  calculateShippingCost,
  calculateSubtotal,
  calculateTotalPhysicalWeightGrams,
  evaluateCoupon,
  getEffectiveUnitPrice,
} from "./commerce";

describe("commerce helpers", () => {
  it("uses discountPrice when lower than regular price", () => {
    expect(getEffectiveUnitPrice({ price: 1000, discountPrice: 799 })).toBe(799);
    expect(getEffectiveUnitPrice({ price: 1000, discountPrice: null })).toBe(1000);
    expect(getEffectiveUnitPrice({ price: 1000, discountPrice: 1200 })).toBe(1000);
  });

  it("calculates subtotal and physical weight ignoring ebooks", () => {
    const lines = [
      {
        book: {
          price: 500,
          discountPrice: 400,
          weightGrams: 350,
          format: "PAPERBACK",
        },
        quantity: 2,
      },
      {
        book: {
          price: 300,
          discountPrice: null,
          weightGrams: 500,
          format: "EBOOK",
        },
        quantity: 1,
      },
    ];

    expect(calculateSubtotal(lines)).toBe(1100);
    expect(calculateTotalPhysicalWeightGrams(lines)).toBe(700);
  });

  it("computes weight and PIN-based shipping with free threshold", () => {
    const physical = [
      {
        book: {
          price: 400,
          discountPrice: null,
          weightGrams: 700,
          format: "PAPERBACK",
        },
        quantity: 1,
      },
    ];

    expect(
      calculateShippingCost({
        lines: physical,
        subtotalAfterDiscount: 400,
        postalCode: "560038",
      })
    ).toBe(69); // 49 + 20 for 2nd 500g slab

    expect(
      calculateShippingCost({
        lines: physical,
        subtotalAfterDiscount: 400,
        postalCode: "791111",
      })
    ).toBe(89); // remote surcharge

    expect(
      calculateShippingCost({
        lines: physical,
        subtotalAfterDiscount: 1200,
        postalCode: "791111",
      })
    ).toBe(0); // free shipping >= 999
  });

  it("evaluates percent and fixed coupons with constraints", () => {
    const activePercent = {
      code: "READ10",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderAmount: 500,
      maxUses: 100,
      usedCount: 5,
      expiresAt: null,
      isActive: true,
    };

    expect(evaluateCoupon(activePercent, 1000)).toEqual({
      valid: true,
      discountAmount: 100,
    });
    expect(evaluateCoupon(activePercent, 300).valid).toBe(false);
    expect(
      evaluateCoupon({ ...activePercent, usedCount: 100 }, 1000).valid
    ).toBe(false);
    expect(
      evaluateCoupon(
        { ...activePercent, expiresAt: new Date("2020-01-01") },
        1000
      ).valid
    ).toBe(false);
  });
});
