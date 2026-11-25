import { z } from "zod";

export const BOOK_FORMATS = ["PAPERBACK", "HARDCOVER", "EBOOK"] as const;
export type BookFormat = (typeof BOOK_FORMATS)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ROLES = ["CUSTOMER", "ADMIN"] as const;
export type UserRole = (typeof ROLES)[number];

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

export const bookPayloadSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    slug: z.string().trim().optional(),
    author: z.string().trim().min(1, "Author is required").max(160),
    authorBio: z.string().trim().max(2000).optional().nullable(),
    isbn10: z.string().trim().max(20).optional().nullable(),
    isbn13: z.string().trim().max(20).optional().nullable(),
    description: z.string().trim().min(10, "Description is required"),
    price: z.coerce.number().positive("Price must be greater than 0"),
    discountPrice: z.coerce
      .number()
      .positive("Discount price must be greater than 0")
      .optional()
      .nullable(),
    stockQuantity: z.coerce
      .number()
      .int()
      .min(0, "Stock cannot be negative")
      .default(0),
    weightGrams: z.coerce
      .number()
      .int()
      .min(0, "Weight cannot be negative")
      .default(350),
    coverImageUrl: z
      .string()
      .trim()
      .min(1, "Cover image URL is required")
      .refine(
        (val) =>
          val.startsWith("http://") ||
          val.startsWith("https://") ||
          val.startsWith("/"),
        "Cover image must be a valid URL or local asset path"
      ),
    galleryUrls: z.array(z.string().trim()).optional().default([]),
    format: z.enum(BOOK_FORMATS).default("PAPERBACK"),
    language: z.string().trim().min(2).max(40).default("English"),
    pages: z.coerce.number().int().positive().optional().nullable(),
    publisher: z.string().trim().max(120).optional().nullable(),
    publishedDate: z.string().trim().optional().nullable(),
    categoryId: z.string().trim().min(1, "Category is required"),
    isFeatured: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
  })
  .refine(
    (data) =>
      data.discountPrice == null || data.discountPrice < data.price,
    {
      message: "Discounted price must be lower than regular price",
      path: ["discountPrice"],
    }
  );

export const csvBookRowSchema = z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1),
  isbn13: z.string().trim().optional().default(""),
  isbn10: z.string().trim().optional().default(""),
  description: z.string().trim().min(5),
  category: z.string().trim().min(1),
  price: z.coerce.number().positive(),
  discountPrice: z
    .union([z.coerce.number().positive(), z.literal(""), z.null(), z.undefined()])
    .transform((v) => (typeof v === "number" ? v : null)),
  stockQuantity: z.coerce.number().int().min(0).default(10),
  weightGrams: z.coerce.number().int().min(0).default(350),
  format: z
    .string()
    .trim()
    .toUpperCase()
    .pipe(z.enum(BOOK_FORMATS))
    .default("PAPERBACK"),
  language: z.string().trim().default("English"),
  pages: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.null(), z.undefined()])
    .transform((v) => (typeof v === "number" ? v : null)),
  publisher: z.string().trim().optional().default(""),
  coverImageUrl: z.string().trim().min(1),
  isFeatured: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === "true" || v === "1")
    .default(false),
});

export const cartItemSchema = z.object({
  bookId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(50),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().min(7, "Valid phone number is required").max(20),
  line1: z.string().trim().min(3, "Address line 1 is required"),
  line2: z.string().trim().optional().default(""),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  postalCode: z.string().trim().min(4, "Postal / PIN code is required").max(12),
  country: z.string().trim().min(2).default("India"),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        bookId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(50),
      })
    )
    .min(1, "Cart cannot be empty"),
  shippingAddress: shippingAddressSchema,
  guestEmail: z.string().trim().email().optional().nullable(),
  couponCode: z.string().trim().optional().nullable(),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(3, "Please write a short review").max(1500),
});

export const adminOrderUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  trackingNumber: z.string().trim().max(100).optional().nullable(),
});

export const couponValidateSchema = z.object({
  code: z.string().trim().min(1),
  subtotal: z.coerce.number().nonnegative(),
});
