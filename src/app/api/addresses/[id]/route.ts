import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth/customer";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const address = await prisma.address.findUnique({ where: { id: params.id } });
  if (!address || address.customerId !== customer.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.address.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
