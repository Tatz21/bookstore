import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validators";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const { slug } = await params;
    const book = await prisma.book.findUnique({ where: { slug } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid review" },
        { status: 400 }
      );
    }

    const review = await prisma.$transaction(async (tx) => {
      const saved = await tx.review.upsert({
        where: {
          bookId_userId: {
            bookId: book.id,
            userId: session.user.id,
          },
        },
        update: {
          rating: parsed.data.rating,
          comment: parsed.data.comment,
        },
        create: {
          bookId: book.id,
          userId: session.user.id,
          rating: parsed.data.rating,
          comment: parsed.data.comment,
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      });

      const stats = await tx.review.aggregate({
        where: { bookId: book.id },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.book.update({
        where: { id: book.id },
        data: {
          ratingAvg: Math.round((stats._avg.rating ?? 0) * 10) / 10,
          reviewCount: stats._count.rating,
        },
      });

      return saved;
    });

    revalidatePath(`/books/${slug}`);
    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("POST /api/books/[slug]/reviews error:", err);
    return NextResponse.json(
      { error: "Unable to submit review" },
      { status: 500 }
    );
  }
}
