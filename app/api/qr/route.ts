// app/api/qr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateQRUrl } from "@/lib/qr";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cafe_slug = searchParams.get("cafe_slug");
  const table_id = searchParams.get("table_id");

  if (!cafe_slug || !table_id) {
    return NextResponse.json(
      { error: "cafe_slug and table_id are required" },
      { status: 400 }
    );
  }

  const url = generateQRUrl(cafe_slug, table_id);
  return NextResponse.json({ url });
}