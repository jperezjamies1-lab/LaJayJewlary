# Jay La Joyería — Website Platform

Luxury jewelry e-commerce site with an AI shopping concierge and a full hidden
admin CMS, scaffolded from the Master Plan (Parts 3–5).

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL ·
Claude (Anthropic API) for the AI Concierge · Framer Motion · Lucide Icons.

## What's built in this pass

**Foundation**
- Full project scaffold matching the Part 5 folder structure
- Prisma schema covering every table in the plan (products, orders, customers,
  inventory, reviews, coupons, AI conversations, admin roles/permissions,
  activity log, analytics snapshots, etc.)
- Design token system (colors, type, motion) — see Design Plan below

**Storefront**
- Homepage: hero, trust bar, featured grid, Live Shopping teaser
- Header/Footer wired to a central `SITE` config (so a phone number change
  propagates everywhere, per the Part 4 "one connected system" requirement)
- `ProductCard` component with the signature gold "thread" underline detail
- `/api/products` route

**AI Concierge**
- Floating bilingual chat widget (`AiConciergeWidget`) with quick-prompt
  shopping-mode starters
- `/api/ai/chat` route: real Claude tool-use loop against the live database
  (`search_products`, `get_order_status`, `compare_products`,
  `escalate_to_human`) — this is what makes "AI never invents information"
  actually enforceable, not just a prompt instruction
- System prompt encoding the Part 3 personality and hard rules

**Admin**
- Hidden `/admin/login` (not linked anywhere, `noindex`, rate-limited,
  bcrypt + JWT session, 2FA-ready schema)
- `middleware.ts` protecting all `/admin/dashboard/*` routes
- Dashboard home: today's stats, quick actions, top products, recent AI
  conversations
- Products list page with search/status/quick actions
- Sidebar covering all major sections from Part 3 (Products, Orders,
  Customers, Jay AI, Discounts, Media, Live Shopping, Analytics, Settings)

## Not yet built (next passes)
Order management screens, customer management, discount/coupon UI, media
library, homepage drag-and-drop builder, analytics charts, review moderation,
live shopping scheduler, email system, and the Spanish-locale routing layer.
Each is a natural next slice — the schema and navigation already have a slot
for all of them.

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, Supabase keys — ANTHROPIC_API_KEY is optional
npm run db:push
npm run db:seed        # creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME in .env
npm run dev
```

Visit `http://localhost:3000` for the storefront and
`http://localhost:3000/admin/login` for the admin panel.

## Deploying to Cloudflare Workers

This app uses Prisma driver adapters (not the default Rust query engine,
which cannot run on Workers) via `@prisma/adapter-pg` + Cloudflare Hyperdrive.

```bash
# 1. Create a Hyperdrive binding pointing at your Postgres database
npx wrangler hyperdrive create jay-la-joyeria-db --connection-string="$DATABASE_URL"
# paste the returned id into wrangler.jsonc under hyperdrive[0].id

# 2. Set secrets (these are NOT read from .env in production)
npx wrangler secret put JWT_SECRET
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put NEXT_PUBLIC_SUPABASE_URL
npx wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
npx wrangler secret put RESEND_API_KEY        # optional — emails are skipped gracefully if unset
npx wrangler secret put ANTHROPIC_API_KEY     # optional — AI widget hides itself if unset

# 3. Build and deploy
npm run build:worker
npm run deploy

# Or preview locally against the Workers runtime before deploying:
npm run preview
```

**Not verified in this environment** — building this project happened in a
sandbox with no network access to Cloudflare or to Prisma's engine-binary
host, so `npx prisma generate`, `npm run build`, and `npm run build:worker`
have not been run successfully end-to-end here. The code is written against
the documented Prisma driver-adapter + Hyperdrive pattern, but the first
real build/deploy should happen in an environment with genuine Cloudflare
access, and any errors that surface there haven't been seen or fixed yet.


- **Colors:** onyx `#0B0B0C`, ivory `#F7F3EC`, antique gold `#C6A15B`, garnet
  `#8B1E3F`, graphite `#3A3A3C`
- **Type:** Cormorant (display), Inter (body/UI), IBM Plex Mono (prices, SKUs,
  order numbers)
- **Signature element:** a thin gold "thread" line that traces itself once
  under section headers and prices — a quiet nod to a jewelry chain link
