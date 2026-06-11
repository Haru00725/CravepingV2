// app/[cafe_slug]/page.tsx
// Handles cravepingv2.vercel.app/brew-lab (no table ID)
// Renders the menu normally — customer enters table number when ordering

import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import MenuClient from "@/components/menu/MenuClient";
import type { Cafe, Dish } from "@/types";

interface PageProps {
  params: Promise<{ cafe_slug: string }>;
}

export default async function CafeMenuPage({ params }: PageProps) {
  const { cafe_slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: cafe } = await supabase
    .from("cafes")
    .select("*")
    .eq("slug", cafe_slug)
    .eq("plan_active", true)
    .single<Cafe>();

  if (!cafe) notFound();

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
      tableId=""
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { cafe_slug } = await params;
  return {
    title: `Menu — ${cafe_slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} | CravePing`,
  };
}