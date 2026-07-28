# Jay La Joyería — Rebuild Checklist

Tracks the rebuild against the route/functionality audit. Say "continue"
and I'll pick up from the first unchecked item.

## Ground rules being followed
- No hardcoded product/order/customer/analytics arrays anywhere — everything through Prisma
- No mock API responses, no sample products, no seeded demo data
- Store starts with ZERO products until added via admin
- Spanish (Mexico) is the default/primary language site-wide

## Known hard limits (see chat for full explanation)
- `npx prisma generate`, `npm run build`, and `npm run build:worker` have not
  been run successfully in this sandbox — no network egress to
  binaries.prisma.sh or Cloudflare from here. Code is written correctly
  against documented patterns but unverified end-to-end.
- Cannot provision a live Postgres DB, Supabase project/buckets, Hyperdrive
  binding, or email provider — code is env-var driven with zero mock fallback.

## Route audit — all now built and real
- [x] /admin/dashboard/productos/nuevo, /[id]
- [x] /admin/dashboard/pedidos/[orderNumber]
- [x] /admin/dashboard/clientes/[id]
- [x] /admin/dashboard/ai — real conversation viewer (chat route now persists to DB)
- [x] /admin/dashboard/descuentos — real coupon CRUD
- [x] /admin/dashboard/media — real upload/search/rename/delete (R2 + DB)
- [x] /admin/dashboard/live — real event scheduler
- [x] /admin/dashboard/analytics — real DB-derived numbers only (no visitor/traffic-source tracking exists, so those are omitted rather than faked)
- [x] /admin/dashboard/settings — full settings form
- [x] /admin/dashboard/logs — searchable activity log viewer
- [x] /api/admin/orders/export
- [x] /cuenta/direcciones — real address CRUD
- [x] /cuenta/pedidos/[orderNumber]
- [x] /envios, /devoluciones, /privacidad, /terminos, /cuidado — DB-backed policy pages
- [x] /live — real live shopping schedule

## Homepage — fixed
- [x] Unsplash hero removed
- [x] "Autumn Collection" removed
- [x] Hardcoded 18k gold / ethically sourced claim removed
- [x] Zero products = polished Spanish empty state
- [x] Real branding (/public/branding) used in hero

## Spanish (Mexico) first — done
- [x] jay_locale cookie + middleware browser-language auto-detection
- [x] Working language switcher in header
- [x] <html lang="es-MX">, Header/Footer/AI widget default to Spanish
- [x] Homepage, product page, order status panel translated
- [ ] Cart/checkout/login/register client pages still show English-first UI text (functional, just not yet translated — real remaining gap)

## Admin settings — real
- [x] Setting DB table + getSiteSettings()/updateSiteSettings()
- [x] SiteSettingsProvider replacing hardcoded SITE constant everywhere (Header, Footer, OrderStatusPanel, checkout API, AI system prompt, root layout metadata/JSON-LD)
- [x] Every field from the spec editable: name, email, phone, Zelle, WhatsApp, hours, social, shipping price/threshold, hero image, SEO, all 5 policy pages

## Product management — real
- [x] Create/edit/delete/archive/hide/feature/duplicate, multi-image upload, SKU/material/inventory/collection/status/SEO
- [ ] Spanish/English description as separate fields (currently one description field)
- [ ] Variants management UI (schema supports it, no admin UI yet)

## Orders & Zelle — real
- [x] Create order → Zelle instructions → screenshot upload → admin approval → processing
- [x] Admin: approve, reject payment (new), status changes, tracking, cancel, notes (new), export
- [x] Every action logged

## Logs — real, searchable
- [x] Admin login/logout, failed login, rate-limit hits, product/order/customer/coupon/settings changes, media uploads, AI conversations
- [x] Search + category filter UI

## Media & R2 — real
- [x] Upload/list/search/rename/delete wired to R2 + DB
- [ ] "Replace" as a distinct action (currently: delete + re-upload)

## Security — fixed
- [x] Hardcoded ChangeMe123! removed
- [x] ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME required env vars, refuses to seed without them
- [x] Password hashed (bcrypt, cost 12)
- [x] Admin logout route + logging (was completely missing before this pass)

## Cloudflare Workers — config written, unverified
- [x] @opennextjs/cloudflare + wrangler added
- [x] open-next.config.ts, wrangler.jsonc
- [x] build:worker / deploy / preview scripts
- [x] Prisma driver adapters (@prisma/adapter-pg) + Hyperdrive-aware db.ts
- [ ] Actual verified build/deploy (blocked by sandbox network access — see Known hard limits)

## Final audit — partial
- [x] npm install succeeds
- [ ] npx prisma generate (blocked in sandbox)
- [ ] npm run build (depends on generated client)
- [ ] npm run build:worker (depends on the above + live Cloudflare access)
- [x] tsc --noEmit clean except the ungenerated-Prisma-client cascade (re-verify after this batch)


## Storage migration: Cloudflare R2 -> Supabase Storage (owner has no payment card)
- [x] Removed @aws-sdk R2 client entirely, replaced with @supabase/supabase-js
- [x] Two buckets: public-media (public — products/logo/banners/collections/reviews),
      payment-proofs (private — Zelle screenshots, signed URLs only, 5 min expiry)
- [x] Media upload route, media delete route, product delete (cascade storage cleanup)
      all moved to Supabase
- [x] Payment screenshot upload now goes to the private bucket; DB field stores a
      Storage *path*, never a public URL; a dedicated signed-URL endpoint
      (owning customer or any admin only) is the only way to view one
- [x] Public order API no longer returns the raw path at all — just a
      hasPaymentProof boolean, to avoid leaking internal path structure
- [x] File validation tightened to spec: product images JPEG/PNG/WebP/AVIF max 8MB,
      payment screenshots JPEG/PNG/WebP (no PDF) max 8MB, unique collision-proof filenames
- [x] .env.example: R2_* removed, NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
      / SUPABASE_SERVICE_ROLE_KEY added
- [ ] Homepage editor / collection editor / reviews upload flows aren't built yet at
      all (tracked above as pre-existing gaps) — when built, they should use
      uploadPublicMedia() from src/lib/storage/supabase.ts, same as the product form

## AI made fully optional (no Anthropic credits required)
- [x] Anthropic client no longer constructed at module scope (was throwing on
      missing key, which would have broken cold starts / builds)
- [x] /api/ai/status — real endpoint the widget checks on mount
- [x] AiConciergeWidget renders nothing when disabled — no button, no crash
- [x] Chat route returns a graceful "Asistente no disponible por el momento" /
      "Assistant unavailable" reply (200, not an error) if called anyway with no key
- [x] Search, products, checkout, orders, and all admin features verified to have
      no dependency on ANTHROPIC_API_KEY being set
