"use client";
// components/detail/DetailView.tsx

import { useRef, useEffect } from "react";
import type { Dish } from "@/types";
import Stars from "../ui/Stars";

interface Props {
  dish: Dish;
  liked: boolean;
  onLike: () => void;
  onAdd: () => void;
  onClose: () => void;
}

export default function DetailView({ dish, liked, onLike, onAdd, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [dish]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Full-screen video */}
      <video
        ref={videoRef}
        src={dish.r2_video_url}
        poster={dish.thumbnail_url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted
        playsInline
        autoPlay
      />
      {/* Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/30" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-12 right-4 z-10 w-10 h-10 rounded-full glass flex items-center justify-center"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Glassmorphism bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 animate-fade-up">
        <div className="glass rounded-3xl p-5">
          {/* Name + like */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-white text-[26px] font-bold leading-tight">{dish.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Stars rating={dish.rating} size="md" />
                <span className="text-white/55 text-xs">{dish.votes.toLocaleString()} scores</span>
              </div>
            </div>
            <button onClick={onLike} className="mt-1 active:scale-90 transition-transform">
              <svg
                className={`w-7 h-7 transition-colors duration-150 ${liked ? "text-red-500" : "text-white"}`}
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {dish.tags.map((tag) => (
              <span key={tag} className="glass-dark text-white/80 text-xs px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* Nutrition chips */}
          <div className="flex gap-2.5 mb-4">
            {[
              { label: "kcal", value: dish.calories },
              { label: "protein", value: `${dish.protein}g` },
              { label: "price", value: `₹${dish.price}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 glass-dark rounded-2xl p-3 text-center">
                <p className="text-amber-400 text-lg font-bold">{value}</p>
                <p className="text-white/55 text-[11px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <p className="text-white/65 text-sm leading-relaxed mb-4">
            {dish.description || `${dish.subtitle}. Freshly prepared with handpicked ingredients.`}
          </p>

          {/* CTA */}
          <button
            onClick={() => { onAdd(); onClose(); }}
            className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-white text-base font-bold transition-all duration-100 shadow-lg"
          >
            Add to Order — ₹{dish.price}
          </button>
        </div>
      </div>
    </div>
  );
}
