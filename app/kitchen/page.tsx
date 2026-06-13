"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Load existing pending orders
    supabase
      .from("orders")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .then(({ data }) => setOrders(data ?? []));

    // Listen for new orders in realtime
    const channel = supabase
      .channel("kitchen-orders")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "orders",
      }, (payload) => {
        setOrders((prev) => [...prev, payload.new]);
        new Audio("/notification.mp3").play().catch(() => {});
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const markDone = async (id: string) => {
    await supabase.from("orders").update({ status: "completed" }).eq("id", id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-amber-500 tracking-widest">
          KITCHEN DISPLAY
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-500 text-xs font-semibold">LIVE</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-white/20">
          <p className="text-6xl mb-4">🍽️</p>
          <p className="text-lg">No pending orders</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#2a2a2a] rounded-2xl p-5 border border-amber-500/30"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-amber-500 font-black text-xl">
                    Table {order.table_id.replace("table-", "")}
                  </p>
                  <p className="text-white/60 text-sm">{order.customer_name}</p>
                </div>
                <p className="text-white/30 text-xs">
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>

              <div className="space-y-1.5 mb-4 border-t border-white/10 pt-3">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <p className="text-white text-sm">
                      <span className="text-amber-400 font-bold">{item.qty}x</span>{" "}
                      {item.name}
                    </p>
                    <p className="text-white/40 text-sm">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-white/10 pt-3">
                <p className="text-amber-400 font-black text-lg">₹{order.total}</p>
                <button
                  onClick={() => markDone(order.id)}
                  className="bg-green-500 hover:bg-green-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  ✓ Mark Done
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}