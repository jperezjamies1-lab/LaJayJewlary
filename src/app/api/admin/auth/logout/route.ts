import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { logActivity } from "@/lib/log";

export async function POST() {
  const session = await getAdminSession();
  if (session) {
    await logActivity({ category: "LOGOUT", action: "ADMIN_LOGOUT", adminId: session.id });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("jay_admin_session");
  return res;
}
