import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";
import { logActivity } from "@/lib/log";

const Schema = z.object({
  vipStatus: z.boolean().optional(),
  blocked: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin("customers.write");
    const body = Schema.parse(await req.json());

    const customer = await prisma.customer.update({ where: { id: params.id }, data: body });

    await logActivity({
      category: "CUSTOMER",
      action: "UPDATE",
      adminId: session.id,
      entity: "Customer",
      entityId: customer.id,
    });

    return NextResponse.json({ customer });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
