import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookForm } from "@/components/admin/BookForm";

export const dynamic = "force-dynamic";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [book, categories] = await Promise.all([
    prisma.book.findUnique({ where: { id } }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!book) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-editorial text-3xl font-semibold text-[var(--text-primary)]">
          Edit Book: {book.title}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Update pricing, inventory, cover image, or metadata.
        </p>
      </div>

      <BookForm
        categories={categories}
        initial={{
          id: book.id,
          title: book.title,
          author: book.author,
          authorBio: book.authorBio || "",
          isbn10: book.isbn10 || "",
          isbn13: book.isbn13 || "",
          description: book.description,
          price: String(book.price),
          discountPrice: book.discountPrice ? String(book.discountPrice) : "",
          stockQuantity: String(book.stockQuantity),
          weightGrams: String(book.weightGrams),
          coverImageUrl: book.coverImageUrl,
          format: book.format,
          language: book.language,
          pages: book.pages ? String(book.pages) : "",
          publisher: book.publisher || "",
          publishedDate: book.publishedDate || "",
          categoryId: book.categoryId,
          isFeatured: book.isFeatured,
        }}
      />
    </div>
  );
}
