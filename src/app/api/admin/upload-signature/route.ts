import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { createCloudinaryUploadSignature } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { folder?: string };
  const sig = createCloudinaryUploadSignature(body.folder || "book_covers");
  return NextResponse.json(sig);
}
