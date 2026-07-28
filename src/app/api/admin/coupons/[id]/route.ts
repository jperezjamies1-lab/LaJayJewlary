import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";
import { logActivity } from "@/lib/log";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin("coupons.write");
    const { active } = await req.json();
    const coupon = await prisma.coupon.update({ where: { id: params.id }, data: { active } });
    await logActivity({ category: "COUPON", action: "UPDATE", adminId: session.id, entity: "Coupon", entityId: coupon.id });
    return NextResponse.json({ coupon });
  } catch (err) {
    if (err instanceof AdminAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin("coupons.write");
    await prisma.coupon.delete({ where: { id: params.id } });
    await logActivity({ category: "COUPON", action: "DELETE", adminId: session.id, entity: "Coupon", entityId: params.id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
