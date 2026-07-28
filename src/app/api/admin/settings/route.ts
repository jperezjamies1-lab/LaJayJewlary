import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, updateSiteSettings } from "@/lib/settings";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";
import { logActivity } from "@/lib/log";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin("settings.write");
    const patch = await req.json();
    const settings = await updateSiteSettings(patch);

    await logActivity({ category: "SETTINGS", action: "UPDATE", adminId: session.id });

    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
