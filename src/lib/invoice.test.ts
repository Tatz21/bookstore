import { describe, expect, it } from "vitest";
import { generateInvoicePdf } from "./invoice";

describe("invoice PDF generation", () => {
  it("produces valid PDF bytes", async () => {
    const bytes = await generateInvoicePdf({
      orderNumber: "FS-261125-TEST1",
      createdAt: new Date("2026-11-25T10:00:00Z"),
      status: "PAID",
      customerName: "Priya Nair",
      customerEmail: "priya@example.com",
      shippingAddress: {
        line1: "42 Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560038",
        country: "India",
      },
      items: [
        {
          title: "Designing Data-Intensive Applications",
          author: "Martin Kleppmann",
          quantity: 1,
          priceAtPurchase: 1499,
        },
      ],
      subtotal: 1499,
      discountAmount: 0,
      shippingAmount: 0,
      totalAmount: 1499,
      currency: "INR",
    });

    const header = Buffer.from(bytes.slice(0, 5)).toString("ascii");
    expect(header).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(500);
  });
});
