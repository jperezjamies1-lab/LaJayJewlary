import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { LOCALE_COOKIE } from "@/lib/locale";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

function detectLocale(req: NextRequest): "es" | "en" {
  const header = req.headers.get("accept-language") ?? "";
  // Spanish (Mexico) is the default; only switch to English if the browser's
  // top-ranked language is explicitly English and Spanish isn't present at all.
  const first = header.split(",")[0]?.toLowerCase() ?? "";
  if (first.startsWith("en") && !header.toLowerCase().includes("es")) {
    return "en";
  }
  return "es";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const res = NextResponse.next();

  // Automatic browser-language detection, once per visitor.
  if (!req.cookies.get(LOCALE_COOKIE)?.value) {
    res.cookies.set(LOCALE_COOKIE, detectLocale(req), {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
  }

  // Belt-and-suspenders: even though robots.txt disallows /admin, also
  // set a header so any admin response is never indexed.
  if (pathname.startsWith("/admin")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  if (pathname.startsWith("/admin/dashboard")) {
    const token = req.cookies.get("jay_admin_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      const redirect = NextResponse.redirect(new URL("/admin/login", req.url));
      redirect.cookies.delete("jay_admin_session");
      return redirect;
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|branding|android-chrome|apple-touch-icon|site.webmanifest).*)"],
};
