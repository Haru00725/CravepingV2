// types/index.ts

export interface Cafe {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  address: string | null;
  plan: "video_menu" | "review" | "both" | "free";
  plan_active: boolean;
  created_at: string;
}

export interface Dish {
  id: string;
  cafe_id: string;
  name: string;
  subtitle: string;
  description: string;
  category: "Starter" | "Maincourse" | "Drinks" | "Dessert";
  price: number;
  rating: number;
  votes: number;
  calories: number;
  protein: number;
  r2_video_url: string;
  thumbnail_url: string;
  tags: string[];
  is_available: boolean;
  sort_order: number;
  created_at: string;
}

export interface CartItem extends Dish {
  qty: number;
}

export interface Order {
  id: string;
  cafe_id: string;
  cafe_slug: string;
  table_id: string;
  customer_name: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  created_at: string;
}

export interface OrderItem {
  dish_id: string;
  name: string;
  qty: number;
  price: number;
}

export interface QRPayload {
  cafe_slug: string;
  table_id: string;
  date: string; // YYYY-MM-DD, expires daily
  sig: string;  // HMAC-SHA256 hex
}

export interface TableMapping {
  id: string;
  cafe_id: string;
  table_id: string;
  label: string;   // e.g. "Table 4", "Rooftop 1"
  qr_url: string;
}
