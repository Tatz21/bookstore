import { prisma } from "@/lib/prisma";
import { BookForm } from "@/components/admin/BookForm";

export const dynamic = "force-dynamic";

export default async function NewBookPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-editorial text-3xl font-semibold text-[var(--text-primary)]">
          Upload New Book
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Use ISBN Auto-Fill or manually enter catalog metadata and cover art.
        </p>
      </div>
      <BookForm categories={categories} />
    </div>
  );
}
