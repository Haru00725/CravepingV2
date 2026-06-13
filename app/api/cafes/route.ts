// app/api/cafes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generateQRUrl } from "@/lib/qr";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const cafe_slug = searchParams.get("cafe_slug");
  const table_id = searchParams.get("table_id");

  const supabase = createServiceClient();

  // QR URL generation — /api/cafes?cafe_slug=brew-lab&table_id=table-1
  if (cafe_slug && table_id) {
    const url = generateQRUrl(cafe_slug, table_id);
    return NextResponse.json({ url });
  }

  // Single cafe — /api/cafes?slug=brew-lab
  if (slug) {
    const { data, error } = await supabase
      .from("cafes")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ cafe: data });
  }

  // All cafes — /api/cafes
  const { data, error } = await supabase
    .from("cafes")
    .select("*")
    .order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cafes: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("cafes")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ cafe: data }, { status: 201 });
}