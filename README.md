# CravePing 🍽️

Video-first digital menu SaaS for Indian cafés and restaurants.

## Stack
- **Frontend**: Next.js 15 App Router + Tailwind CSS
- **Database**: Supabase (multi-tenant, RLS)
- **Video/Media**: Cloudflare R2
- **LLM (reviews)**: Groq `llama-3.1-8b-instant`
- **Deployment**: Vercel (region: bom1 — Mumbai)
- **QR Security**: HMAC-SHA256 signed, daily-expiring

---

## Project Structure

```
craveping/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing / demo redirect
│   ├── globals.css                   # Tailwind + custom CSS
│   ├── [cafe_slug]/
│   │   └── [table_id]/
│   │       └── page.tsx              # Server component — fetches café + dishes
│   └── api/
│       ├── orders/route.ts           # POST order, GET orders (kitchen)
│       ├── dishes/route.ts           # CRUD for dishes
│       └── cafes/route.ts            # Café onboarding + QR generation
├── components/
│   ├── menu/
│   │   ├── MenuClient.tsx            # Main feed — all state lives here
│   │   ├── HeroCard.tsx              # Video card with autoplay
│   │   └── PopularCard.tsx           # Popular dishes list row
│   ├── detail/
│   │   └── DetailView.tsx            # Fullscreen reels-style detail
│   ├── cart/
│   │   └── CartDrawer.tsx            # Slide-in cart + order placement
│   └── ui/
│       └── Stars.tsx                 # Star rating display
├── lib/
│   ├── supabase.ts                   # Browser + server + service clients
│   ├── qr.ts                         # HMAC QR signing & verification
│   └── r2.ts                         # Cloudflare R2 upload/delete
├── types/
│   └── index.ts                      # All TypeScript interfaces
├── supabase-schema.sql               # Run once in Supabase SQL editor
├── vercel.json                       # Vercel deployment config
└── .env.local                        # Local environment variables
```

---

## Setup (Step by Step)

### 1. Clone & Install

```bash
git clone <your-repo>
cd craveping
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase-schema.sql`
3. Copy your **Project URL** and **anon key** from Project Settings → API

### 3. Cloudflare R2

1. Go to Cloudflare dashboard → R2 → Create bucket `craveping-media`
2. Enable **Public access** on the bucket
3. Create an **API token** with R2 write permissions
4. Set `R2_PUBLIC_URL` to the bucket's public domain

### 4. Environment Variables

Copy `.env.local` and fill in all values:

```bash
cp .env.local .env.local.real
# Edit .env.local.real with your actual keys
```

Generate a QR secret:
```bash
openssl rand -hex 32
```

### 5. Run Locally

```bash
npm run dev
# Open http://localhost:3000/brew-lab/table-1
```

The demo cafe `brew-lab` is seeded by the SQL schema.

### 6. Deploy to Vercel

```bash
npm i -g vercel
vercel
# Add all env vars from .env.local in the Vercel dashboard
```

---

## URL Structure

```
craveping.in/{cafe_slug}/{table_id}?date=YYYY-MM-DD&sig=HMAC
```

- `cafe_slug` — matches `cafes.slug` in Supabase
- `table_id` — e.g. `table-3`, `rooftop-1`
- `date` + `sig` — HMAC-SHA256 signed, verified server-side, expires daily

In development, QR verification is skipped so you can open any URL directly.

---

## Adding a New Café

```sql
-- In Supabase SQL Editor
insert into cafes (slug, name, plan, plan_active)
values ('my-cafe', 'My Café', 'both', true);
```

Then add dishes via the `/api/dishes` POST endpoint or directly in Supabase.

---

## Pricing Tiers (your existing structure)

| Plan | Price | Features |
|------|-------|----------|
| Video Menu | ₹4,999/mo | Full video menu + ordering |
| Review Automation | ₹2,499/mo | Groq-powered Google review replies |
| Both | ₹6,499/mo | Everything |
