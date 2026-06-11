"use client";
// components/menu/HeroCard.tsx

import { useRef, useEffect } from "react";
import type { Dish } from "@/types";

interface Props {
  dish: Dish;
  onOpen: () => void;
  onAdd: (e: React.MouseEvent) => void;
}

export default function HeroCard({ dish, onOpen, onAdd }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.5 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      onClick={onOpen}
      className="relative flex-shrink-0 w-64 h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg bg-[#1a1a1a]"
    >
      <video
        ref={videoRef}
        src={dish.r2_video_url}
        poster={dish.thumbnail_url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted
        playsInline
        preload="metadata"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-bold text-lg leading-tight">{dish.name}</p>
        <p className="text-white/65 text-xs mt-0.5 mb-3 line-clamp-2">{dish.subtitle}</p>
        <div className="flex items-center justify-between">
          <span className="text-amber-400 font-bold text-base">₹{dish.price}</span>
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
