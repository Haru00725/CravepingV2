// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cafe_slug, table_id, customer_name, items, total } = body;

    // Basic validation
    if (!cafe_slug || !table_id || !customer_name || !items?.length || !total) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get cafe_id from slug
    const { data: cafe } = await supabase
      .from("cafes")
      .select("id, plan_active")
      .eq("slug", cafe_slug)
      .single();

    if (!cafe || !cafe.plan_active) {
      return NextResponse.json({ error: "Cafe not found or inactive" }, { status: 404 });
    }

    // Insert order
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        cafe_id: cafe.id,
        cafe_slug,
        table_id,
        customer_name,
        items,
        total,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, order_id: order.id }, { status: 201 });
  } catch (err) {
    console.error("[orders POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Used by kitchen dashboard — returns orders for a cafe
  const { searchParams } = new URL(req.url);
  const cafe_slug = searchParams.get("cafe_slug");
  const status = searchParams.get("status"); // optional filter

  if (!cafe_slug) {
    return NextResponse.json({ error: "cafe_slug required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  let query = supabase
    .from("orders")
    .select("*")
    .eq("cafe_slug", cafe_slug)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ orders: data });
}
