import "server-only";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { prisma } from "@/lib/db";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings.client";

// Re-exported so existing server-side imports of `SiteSettings`/`DEFAULT_SETTINGS`
// from "@/lib/settings" keep working unchanged — only Client Components need
// to switch to "@/lib/settings.client" (see that file for why).
export { DEFAULT_SETTINGS, type SiteSettings };

const SETTINGS_KEY = "site";

/**
 * Reads settings from the database, falling back to defaults for any key
 * not yet set. This is what Header/Footer/checkout/emails/AI/metadata all
 * read from now instead of a hardcoded constant — an admin edit here
 * propagates everywhere on the next request.
 *
 * SERVER-ONLY. The `server-only` import above makes any accidental import
 * of this file from a Client Component fail the build loudly instead of
 * silently bundling Prisma/pg into browser code.
 *
 * BUILD-PHASE SHORT-CIRCUIT — this is the important part. `next build`
 * statically renders pages that don't opt out of static generation
 * (including framework-internal ones like app/_not-found), and the root
 * layout calls getSiteSettings() unconditionally. That means this function
 * runs *during the build itself*, not just at request time, for any
 * statically-generated page. Relying on the try/catch below to paper over
 * that with a caught error is the wrong mechanism: it still attempts a real
 * network call during build (slow, and a real failure if the build
 * environment happens to have partial DB access, hangs, or returns stale
 * data instead of erroring cleanly). So the Prisma call is skipped
 * entirely — not attempted and caught, just never made — whenever
 * process.env.NEXT_PHASE identifies this as the production build phase.
 * At real request time (NEXT_PHASE is unset / not this value), it reads
 * the database normally.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    return DEFAULT_SETTINGS;
  }

  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    if (!row) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(row.value as Partial<SiteSettings>) };
  } catch (err) {
    // Request-time DB errors (connection blip, etc.) still fall back
    // gracefully rather than failing the page — this catch is now purely
    // for genuine runtime failures, not a substitute for the build-phase
    // check above.
    console.error("getSiteSettings fallback:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const next = { ...current, ...patch };
  await prisma.setting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: next },
    create: { key: SETTINGS_KEY, value: next },
  });
  return next;
}
