import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";
import { logActivity } from "@/lib/log";

export async function GET() {
  try {
    await requireAdmin("coupons.read");
    const coupons = await prisma.coupon.findMany({ orderBy: { code: "asc" } });
    return NextResponse.json({ coupons });
  } catch (err) {
    if (err instanceof AdminAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
  }
}

const CreateSchema = z.object({
  code: z.string().min(2).transform((s) => s.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.number().min(0),
  minPurchase: z.number().min(0).nullable().optional(),
  vipOnly: z.boolean().default(false),
  usageLimit: z.number().int().min(1).nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin("coupons.write");
    const body = CreateSchema.parse(await req.json());

    const coupon = await prisma.coupon.create({
      data: {
        code: body.code,
        type: body.type,
        value: body.value,
        minPurchase: body.minPurchase ?? undefined,
        vipOnly: body.vipOnly,
        usageLimit: body.usageLimit ?? undefined,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      },
    });

    await logActivity({ category: "COUPON", action: "CREATE", adminId: session.id, entity: "Coupon", entityId: coupon.id });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err) {
    if (err instanceof AdminAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid coupon data" }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
