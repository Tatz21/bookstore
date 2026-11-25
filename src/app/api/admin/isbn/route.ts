import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { lookupBookByIsbn } from "@/lib/isbn-lookup";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isbn = req.nextUrl.searchParams.get("isbn") || "";
  if (!isbn.trim()) {
    return NextResponse.json({ error: "ISBN is required" }, { status: 400 });
  }

  const metadata = await lookupBookByIsbn(isbn);
  if (!metadata) {
    return NextResponse.json(
      { error: "No metadata found for this ISBN" },
      { status: 404 }
    );
  }

  return NextResponse.json({ metadata });
}
