-- ============================================================
-- CravePing — Supabase Database Schema
-- Run this entire file in: Supabase > SQL Editor > New Query
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── CAFES ─────────────────────────────────────────────────────────────────
create table if not exists cafes (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,          -- e.g. "brew-lab"
  name          text not null,
  logo_url      text,
  address       text,
  plan          text not null default 'free'   -- 'video_menu' | 'review' | 'both' | 'free'
                check (plan in ('video_menu', 'review', 'both', 'free')),
  plan_active   boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ── DISHES ────────────────────────────────────────────────────────────────
create table if not exists dishes (
  id              uuid primary key default gen_random_uuid(),
  cafe_id         uuid not null references cafes(id) on delete cascade,
  name            text not null,
  subtitle        text not null default '',
  description     text not null default '',
  category        text not null
                  check (category in ('Starter', 'Maincourse', 'Drinks', 'Dessert')),
  price           integer not null,             -- in INR (paise-free)
  rating          numeric(3,1) not null default 4.0,
  votes           integer not null default 0,
  calories        integer not null default 0,
  protein         integer not null default 0,   -- grams
  r2_video_url    text not null,
  thumbnail_url   text not null,
  tags            text[] not null default '{}',
  is_available    boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists dishes_cafe_id_idx on dishes(cafe_id);
create index if not exists dishes_category_idx on dishes(cafe_id, category);

-- ── ORDERS ────────────────────────────────────────────────────────────────
create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  cafe_id         uuid not null references cafes(id),
  cafe_slug       text not null,
  table_id        text not null,               -- e.g. "table-3"
  customer_name   text not null,
  items           jsonb not null,              -- [{dish_id, name, qty, price}]
  total           integer not null,
  status          text not null default 'pending'
                  check (status in ('pending','preparing','ready','completed','cancelled')),
  created_at      timestamptz not null default now()
);
create index if not exists orders_cafe_idx on orders(cafe_id, created_at desc);
create index if not exists orders_status_idx on orders(cafe_id, status);

-- ── TABLE MAPPINGS ────────────────────────────────────────────────────────
create table if not exists table_mappings (
  id        uuid primary key default gen_random_uuid(),
  cafe_id   uuid not null references cafes(id) on delete cascade,
  table_id  text not null,                     -- e.g. "table-1"
  label     text not null,                     -- e.g. "Table 1", "Rooftop A"
  qr_url    text,
  unique(cafe_id, table_id)
);

-- ── ROW-LEVEL SECURITY ────────────────────────────────────────────────────
-- Public can read cafes and dishes (for the menu page)
alter table cafes  enable row level security;
alter table dishes enable row level security;
alter table orders enable row level security;

create policy "Public cafes readable"
  on cafes for select using (plan_active = true);

create policy "Public dishes readable"
  on dishes for select using (is_available = true);

-- Orders: anyone can insert (customers placing orders), only service role reads
create policy "Anyone can place order"
  on orders for insert with check (true);

-- ── REALTIME ──────────────────────────────────────────────────────────────
-- Enable realtime for the kitchen dashboard to receive new orders instantly
alter publication supabase_realtime add table orders;

-- ── SEED DATA (demo cafe) ─────────────────────────────────────────────────
insert into cafes (slug, name, plan, plan_active)
values ('brew-lab', 'Brew Lab', 'both', true)
on conflict (slug) do nothing;

-- Insert sample dishes (replace r2_video_url / thumbnail_url with real R2 URLs)
with cafe as (select id from cafes where slug = 'brew-lab')
insert into dishes
  (cafe_id, name, subtitle, description, category, price, rating, votes, calories, protein, r2_video_url, thumbnail_url, tags, sort_order)
values
  ((select id from cafe), 'Paneer Tikka', 'Chargrilled cottage cheese, mint chutney', 'Marinated in a blend of spices and grilled to perfection over charcoal.', 'Starter', 249, 4.3, 1240, 320, 18, 'https://www.w3schools.com/html/mov_bbb.mp4', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', ARRAY['veg','grilled','popular'], 1),
  ((select id from cafe), 'Butter Chicken', 'Slow-cooked in rich tomato gravy', 'A classic Punjabi dish with tender chicken in a velvety, mildly spiced sauce.', 'Maincourse', 349, 4.7, 3100, 480, 32, 'https://www.w3schools.com/html/mov_bbb.mp4', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', ARRAY['non-veg','curry','bestseller'], 2),
  ((select id from cafe), 'Cold Coffee', 'Espresso blended with chilled milk', 'Our signature blend — double shot espresso over ice with full-cream milk.', 'Drinks', 149, 4.5, 870, 180, 6, 'https://www.w3schools.com/html/mov_bbb.mp4', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', ARRAY['cold','coffee'], 3),
  ((select id from cafe), 'Gulab Jamun', 'Milk-solid dumplings in rose syrup', 'Soft, melt-in-mouth dumplings soaked overnight in fragrant rose syrup.', 'Dessert', 99, 4.6, 2200, 260, 4, 'https://www.w3schools.com/html/mov_bbb.mp4', 'https://images.unsplash.com/photo-1666471082891-34f49e879c52?w=400', ARRAY['sweet','traditional'], 4),
  ((select id from cafe), 'Dal Makhani', 'Black lentils, cream, slow-cooked 12h', 'Whole black lentils simmered on a slow flame with butter and cream.', 'Maincourse', 279, 4.4, 1800, 420, 22, 'https://www.w3schools.com/html/mov_bbb.mp4', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', ARRAY['veg','lentils'], 5),
  ((select id from cafe), 'Mango Lassi', 'Alphonso mango with hung curd', 'Thick, chilled lassi made with Alphonso mangoes and full-fat yoghurt.', 'Drinks', 129, 4.8, 990, 210, 7, 'https://www.w3schools.com/html/mov_bbb.mp4', 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400', ARRAY['cold','fruity','summer'], 6)
on conflict do nothing;
