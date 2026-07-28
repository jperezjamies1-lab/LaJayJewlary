import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/locale";

export async function POST(req: NextRequest) {
  const { locale } = await req.json();
  if (locale !== "es" && locale !== "en") {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return res;
}
