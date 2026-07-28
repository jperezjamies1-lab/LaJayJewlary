import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";

/**
 * Public, read-only settings endpoint: Browser -> fetch("/api/settings") ->
 * this Route Handler -> Prisma -> Database. No secrets in the payload.
 *
 * SiteSettingsContext itself does NOT call this — the root layout (a Server
 * Component) fetches settings directly via getSiteSettings() and passes them
 * as the initial context value, which avoids a client-side fetch waterfall
 * and a flash of default content on first paint. This endpoint exists for
 * any Client Component that wants to re-fetch fresh settings after an edit
 * (e.g. the admin settings form refreshing without a full page reload)
 * without touching Prisma/pg from browser code either way.
 */
export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}
