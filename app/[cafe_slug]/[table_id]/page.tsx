// app/[cafe_slug]/[table_id]/page.tsx
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { verifyQR } from "@/lib/qr";
import MenuClient from "@/components/menu/MenuClient";
import type { Cafe, Dish } from "@/types";

interface PageProps {
  params: Promise<{ cafe_slug: string; table_id: string }>;
  searchParams: Promise<{ date?: string; sig?: string }>;
}

export default async function MenuPage({ params, searchParams }: PageProps) {
  const { cafe_slug, table_id } = await params;
  const { date, sig } = await searchParams;

  // ── QR signature check (skip in dev for convenience) ──────────────────────
  if (process.env.NODE_ENV === "production") {
    const valid = verifyQR(cafe_slug, table_id, date ?? "", sig ?? "");
    if (!valid) {
      return (
        <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-white text-2xl font-bold mb-2">Invalid QR Code</h1>
          <p className="text-white/50 text-sm">Please scan the QR code on your table again.</p>
        </div>
      );
    }
  }

  const supabase = await createServerSupabaseClient();

  // ── Fetch café ─────────────────────────────────────────────────────────────
  const { data: cafe } = await supabase
    .from("cafes")
    .select("*")
    .eq("slug", cafe_slug)
    .eq("plan_active", true)
    .single<Cafe>();

  if (!cafe) notFound();

  // ── Fetch dishes ───────────────────────────────────────────────────────────
  const { data: dishes } = await supabase
    .from("dishes")
    .select("*")
    .eq("cafe_id", cafe.id)
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  return (
    <MenuClient
      cafe={cafe}
      dishes={(dishes ?? []) as Dish[]}
      cafeSlug={cafe_slug}
      tableId={table_id}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { cafe_slug } = await params;
  return {
    title: `Menu — ${cafe_slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} | CravePing`,
  };
}
