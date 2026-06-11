"use client";
// components/cart/CartDrawer.tsx

import { useState } from "react";
import type { Dish, CartItem } from "@/types";

interface Props {
  cart: CartItem[];
  cafeSlug: string;
  tableId: string;
  onAdd: (dish: Dish) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export default function CartDrawer({ cart, cafeSlug, tableId, onAdd, onRemove, onClose }: Props) {
  const [orderName, setOrderName] = useState("");
  const [tableNo, setTableNo] = useState(tableId.replace("table-", ""));
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const placeOrder = async () => {
    if (!orderName.trim() || !tableNo.trim() || cart.length === 0) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafe_slug: cafeSlug,
          table_id: `table-${tableNo}`,
          customer_name: orderName.trim(),
          items: cart.map((i) => ({ dish_id: i.id, name: i.name, qty: i.qty, price: i.price })),
          total,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("done");
      setTimeout(onClose, 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-[320px] max-w-full bg-[#f5f2e8] flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-black/8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
            {cart.length > 0 && (
              <p className="text-gray-400 text-xs mt-0.5">{cart.reduce((s, i) => s + i.qty, 0)} items</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/8 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-gray-400">
              <svg className="w-10 h-10 mb-2 opacity-25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm">Nothing added yet</p>
              <p className="text-xs mt-1 opacity-60">Tap + Add on any dish</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                <img src={item.thumbnail_url} className="w-12 h-12 rounded-xl object-cover shrink-0" alt={item.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-amber-500 font-bold text-sm">₹{item.price * item.qty}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold text-base flex items-center justify-center active:scale-90 transition-transform"
                  >−</button>
                  <span className="text-sm font-bold w-4 text-center text-gray-800">{item.qty}</span>
                  <button
                    onClick={() => onAdd(item)}
                    className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-base flex items-center justify-center active:scale-90 transition-transform"
                  >+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pt-3 pb-8 border-t border-black/8 space-y-3">
          {cart.length > 0 && (
            <div className="flex justify-between items-center text-[15px] font-bold text-gray-900 px-1">
              <span>Total</span>
              <span className="text-amber-500">₹{total}</span>
            </div>
          )}

          <input
            className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-700 outline-none border border-gray-200 focus:border-amber-400 transition-colors placeholder-gray-400"
            placeholder="Your name"
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
          />
          <input
            type="number"
            className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-700 outline-none border border-gray-200 focus:border-amber-400 transition-colors placeholder-gray-400"
            placeholder="Table number"
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
          />

          {status === "done" ? (
            <div className="w-full py-4 rounded-2xl bg-green-500 text-white text-base font-bold text-center">
              ✓ Order placed!
            </div>
          ) : status === "error" ? (
            <div className="w-full py-4 rounded-2xl bg-red-500 text-white text-base font-bold text-center">
              Something went wrong — try again
            </div>
          ) : (
            <button
              onClick={placeOrder}
              disabled={!cart.length || !orderName.trim() || !tableNo.trim() || status === "loading"}
              className="w-full py-4 rounded-2xl bg-[#1a1a1a] text-white text-base font-bold disabled:opacity-35 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
            >
              {status === "loading"
                ? "Placing order…"
                : cart.length > 0
                ? `Place Order — ₹${total}`
                : "Place Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
