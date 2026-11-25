import { describe, expect, it } from "vitest";
import { bookPayloadSchema, checkoutSchema, csvBookRowSchema } from "./validators";

describe("zod validators", () => {
  it("validates valid book payload and rejects discount >= price", () => {
    const valid = bookPayloadSchema.safeParse({
      title: "Clean Code",
      author: "Robert C. Martin",
      description: "A handbook of agile software craftsmanship.",
      price: 999,
      discountPrice: 799,
      stockQuantity: 10,
      weightGrams: 450,
      coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
      format: "PAPERBACK",
      language: "English",
      categoryId: "cat_1",
    });
    expect(valid.success).toBe(true);

    const badDiscount = bookPayloadSchema.safeParse({
      title: "Clean Code",
      author: "Robert C. Martin",
      description: "A handbook of agile software craftsmanship.",
      price: 500,
      discountPrice: 600,
      coverImageUrl: "https://example.com/cover.jpg",
      categoryId: "cat_1",
    });
    expect(badDiscount.success).toBe(false);
  });

  it("parses CSV bulk upload rows", () => {
    const row = csvBookRowSchema.safeParse({
      title: "Refactoring",
      author: "Martin Fowler",
      description: "Improving the design of existing code.",
      category: "Technology & Design",
      price: "1499",
      discountPrice: "",
      stockQuantity: "8",
      format: "hardcover",
      coverImageUrl: "https://example.com/ref.jpg",
      isFeatured: "true",
    });
    expect(row.success).toBe(true);
    if (row.success) {
      expect(row.data.format).toBe("HARDCOVER");
      expect(row.data.discountPrice).toBeNull();
      expect(row.data.isFeatured).toBe(true);
    }
  });

  it("validates checkout payload", () => {
    const parsed = checkoutSchema.safeParse({
      items: [{ bookId: "b1", quantity: 2 }],
      guestEmail: "guest@example.com",
      shippingAddress: {
        fullName: "Rohan Das",
        phone: "9876543210",
        line1: "12 MG Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560001",
      },
    });
    expect(parsed.success).toBe(true);
  });
});
