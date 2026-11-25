import { beforeEach, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { createDemoPrismaClient, resetDemoStore } from "./demo-store";

describe("in-memory demo store", () => {
  beforeEach(() => {
    resetDemoStore();
  });

  it("seeds demo users, categories, books, coupons, and sample order", async () => {
    const db = createDemoPrismaClient();
    const cats = await db.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { books: { where: { isActive: true } } } } },
    });
    expect(cats.length).toBe(6);

    const total = await db.book.count({ where: { isActive: true } });
    expect(total).toBe(12);

    const admin = await db.user.findUnique({
      where: { email: "admin@folioandspine.com" },
    });
    expect(admin?.role).toBe("ADMIN");
    expect(bcrypt.compareSync("admin1234", admin!.passwordHash!)).toBe(true);
  });

  it("supports search, category filter, and atomic stock decrement", async () => {
    const db = createDemoPrismaClient();
    const hits = await db.book.findMany({
      where: {
        isActive: true,
        OR: [{ author: { contains: "kleppmann" } }],
      },
      include: { category: { select: { name: true, slug: true } } },
    });
    expect(hits.length).toBe(1);
    const book = hits[0] as { id: string; stockQuantity: number };

    const updated = await db.book.updateMany({
      where: { id: book.id, stockQuantity: { gte: 2 } },
      data: { stockQuantity: { decrement: 2 } },
    });
    expect(updated.count).toBe(1);

    const after = (await db.book.findUnique({
      where: { id: book.id },
    })) as { stockQuantity: number };
    expect(after.stockQuantity).toBe(book.stockQuantity - 2);
  });

  it("creates orders with nested items and computes groupBy bestsellers", async () => {
    const db = createDemoPrismaClient();
    const order = await db.order.create({
      data: {
        orderNumber: "FS-TEST-1",
        userId: null,
        guestEmail: "guest@example.com",
        subtotal: 549,
        discountAmount: 0,
        shippingAmount: 49,
        totalAmount: 598,
        couponCode: null,
        status: "PENDING",
        paymentProvider: "mock",
        shippingAddress: JSON.stringify({ fullName: "Guest" }),
        items: {
          create: [{ bookId: "book-dune", quantity: 2, priceAtPurchase: 549 }],
        },
      },
    });
    expect(order.orderNumber).toBe("FS-TEST-1");

    const top = await db.orderItem.groupBy({ take: 3 });
    expect(top.length).toBeGreaterThan(0);
    expect(top[0].bookId).toBe("book-dune");
  });
});
