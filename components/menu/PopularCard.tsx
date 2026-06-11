"use client";
// components/menu/PopularCard.tsx

import type { Dish } from "@/types";
import Stars from "../ui/Stars";

interface Props {
  dish: Dish;
  onOpen: () => void;
  onAdd: (e: React.MouseEvent) => void;
}

export default function PopularCard({ dish, onOpen, onAdd }: Props) {
  return (
    <div
      onClick={onOpen}
      className="relative h-[76px] rounded-2xl overflow-hidden cursor-pointer shadow-sm bg-[#1a1a1a]"
    >
      <img
        src={dish.thumbnail_url}
        className="absolute inset-0 w-full h-full object-cover"
        alt={dish.name}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

      <div className="relative flex items-center justify-between h-full px-4">
        <div>
          <p className="text-white font-bold text-[15px]">{dish.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Stars rating={dish.rating} />
            <span className="text-white/50 text-xs">{dish.votes.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-amber-400 font-bold text-sm">₹{dish.price}</span>
          <button
            onClick={onAdd}
            className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-100"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
