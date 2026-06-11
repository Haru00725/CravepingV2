"use client";
// components/menu/MenuClient.tsx

import { useState } from "react";
import type { Cafe, Dish, CartItem } from "@/types";
import HeroCard from "./HeroCard";
import PopularCard from "./PopularCard";
import DetailView from "../detail/DetailView";
import CartDrawer from "../cart/CartDrawer";

const CATEGORIES = ["Starter", "Maincourse", "Drinks", "Dessert"] as const;

interface Props {
  cafe: Cafe;
  dishes: Dish[];
  cafeSlug: string;
  tableId: string;
}

export default function MenuClient({ cafe, dishes, cafeSlug, tableId }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("Starter");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [detailDish, setDetailDish] = useState<Dish | null>(null);
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const addToCart = (dish: Dish, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCart((prev) => {
      const ex = prev.find((i) => i.id === dish.id);
      if (ex) return prev.map((i) => i.id === dish.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...dish, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) =>
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter((i) => i.qty > 0)
    );

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const visibleDishes = dishes.filter((d) => {
    const matchCat = d.category === activeCategory;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    return search ? matchSearch : matchCat;
  });

  const populars = [...dishes].sort((a, b) => b.votes - a.votes).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f5f2e8]">

      {/* ── MAIN FEED ─────────────────────────────────────────────────────── */}
      <div className={`transition-opacity duration-200 ${detailDish ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

        {/* Sticky header */}
        <div className="sticky top-0 z-30 bg-[#f5f2e8]/92 backdrop-blur-md px-4 pt-10 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2.5 shadow-sm gap-2">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
              <input
                className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400"
                placeholder={`Search ${cafe.name}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {/* Cart / hamburger button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Category tabs */}
          {!search && (
            <div className="flex gap-1 mt-4 overflow-x-auto scrollbar-hide pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                    activeCategory === cat
                      ? "bg-[#1a1a1a] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hero video scroller */}
        <div className="px-4 mt-3">
          {visibleDishes.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              No dishes found
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {visibleDishes.map((dish) => (
                <HeroCard
                  key={dish.id}
                  dish={dish}
                  onOpen={() => setDetailDish(dish)}
                  onAdd={(e) => addToCart(dish, e)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Our Populars */}
        {!search && (
          <div className="px-4 mt-7 pb-12">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">Our Populars</h2>
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0zm-12 0a2 2 0 104 0 2 2 0 00-4 0z" />
              </svg>
            </div>
            <div className="flex flex-col gap-3">
              {populars.map((dish) => (
                <PopularCard
                  key={dish.id}
                  dish={dish}
                  onOpen={() => setDetailDish(dish)}
                  onAdd={(e) => addToCart(dish, e)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── DETAIL VIEW ───────────────────────────────────────────────────── */}
      {detailDish && (
        <DetailView
          dish={detailDish}
          liked={!!liked[detailDish.id]}
          onLike={() => setLiked((p) => ({ ...p, [detailDish.id]: !p[detailDish.id] }))}
          onAdd={() => addToCart(detailDish)}
          onClose={() => setDetailDish(null)}
        />
      )}

      {/* ── CART DRAWER ───────────────────────────────────────────────────── */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          cafeSlug={cafeSlug}
          tableId={tableId}
          onAdd={(dish) => addToCart(dish)}
          onRemove={removeFromCart}
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  );
}
