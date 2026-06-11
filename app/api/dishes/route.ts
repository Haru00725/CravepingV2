// app/api/dishes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cafe_slug = searchParams.get("cafe_slug");
  const category = searchParams.get("category");

  if (!cafe_slug) return NextResponse.json({ error: "cafe_slug required" }, { status: 400 });

  const supabase = createServiceClient();

  const { data: cafe } = await supabase
    .from("cafes")
    .select("id")
    .eq("slug", cafe_slug)
    .single();

  if (!cafe) return NextResponse.json({ error: "Cafe not found" }, { status: 404 });

  let query = supabase
    .from("dishes")
    .select("*")
    .eq("cafe_id", cafe.id)
    .eq("is_available", true)
    .order("sort_order");

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ dishes: data });
}

export async function POST(req: NextRequest) {
  // Admin: create a dish
  const body = await req.json();
  const supabase = createServiceClient();

  const { data, error } = await supabase.from("dishes").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ dish: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  // Admin: update a dish (toggle availability, change price, etc.)
  const body = await req.json();
  const { id, ...updates } = body;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("dishes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ dish: data });
}
