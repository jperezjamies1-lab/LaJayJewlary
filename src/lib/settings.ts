import "server-only";
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
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    if (!row) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(row.value as Partial<SiteSettings>) };
  } catch (err) {
    // DB not reachable at build/prerender time — fall back to defaults
    // rather than failing the page.
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
