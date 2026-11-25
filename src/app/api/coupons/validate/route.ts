import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateCoupon } from "@/lib/commerce";
import { couponValidateSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = couponValidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid coupon code" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: parsed.data.code.toUpperCase() },
    });

    const result = evaluateCoupon(coupon, parsed.data.subtotal);
    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.reason },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: coupon!.code,
      discountAmount: result.discountAmount,
      discountType: coupon!.discountType,
      discountValue: coupon!.discountValue,
    });
  } catch (err) {
    console.error("POST /api/coupons/validate error:", err);
    return NextResponse.json(
      { error: "Unable to validate coupon" },
      { status: 500 }
    );
  }
}
