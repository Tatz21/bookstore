import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import Papa from "papaparse";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { csvBookRowSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as { csvText?: string };
    if (!body.csvText || typeof body.csvText !== "string") {
      return NextResponse.json(
        { error: "csvText payload is required" },
        { status: 400 }
      );
    }

    const parsedCsv = Papa.parse<Record<string, unknown>>(body.csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    const created: string[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    for (let idx = 0; idx < parsedCsv.data.length; idx++) {
      const rowNum = idx + 2; // 1-indexed + header
      const rowParsed = csvBookRowSchema.safeParse(parsedCsv.data[idx]);
      if (!rowParsed.success) {
        errors.push({
          row: rowNum,
          message: rowParsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        });
        continue;
      }

      const row = rowParsed.data;
      const catSlug = slugify(row.category);
      const category = await prisma.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: { name: row.category, slug: catSlug },
      });

      const baseSlug = slugify(`${row.title}-${row.author}`);
      let slug = baseSlug || `book-${Date.now()}-${idx}`;
      if (await prisma.book.findUnique({ where: { slug } })) {
        slug = `${slug}-${Date.now().toString().slice(-4)}-${idx}`;
      }

      try {
        const book = await prisma.book.create({
          data: {
            title: row.title,
            slug,
            author: row.author,
            isbn10: row.isbn10 || null,
            isbn13: row.isbn13 || null,
            description: row.description,
            categoryId: category.id,
            price: row.price,
            discountPrice: row.discountPrice,
            stockQuantity: row.stockQuantity,
            weightGrams: row.format === "EBOOK" ? 0 : row.weightGrams,
            format: row.format,
            language: row.language,
            pages: row.pages,
            publisher: row.publisher || null,
            coverImageUrl: row.coverImageUrl,
            isFeatured: row.isFeatured,
          },
        });
        created.push(book.title);
      } catch (dbErr) {
        errors.push({
          row: rowNum,
          message:
            dbErr instanceof Error
              ? dbErr.message.split("\n").pop() || "Database error"
              : "Failed to insert row",
        });
      }
    }

    revalidatePath("/");
    revalidatePath("/books");

    return NextResponse.json({
      importedCount: created.length,
      errorCount: errors.length,
      created,
      errors,
    });
  } catch (err) {
    console.error("POST /api/admin/books/bulk error:", err);
    return NextResponse.json(
      { error: "Failed to process CSV upload" },
      { status: 500 }
    );
  }
}
