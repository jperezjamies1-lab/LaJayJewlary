import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth/customer";

const Schema = z.object({ productId: z.string() });

export async function GET() {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ items: [] });

  const items = await prisma.wishlistItem.findMany({
    where: { customerId: customer.id },
    include: { product: { include: { images: true } } },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "Please sign in to save items." }, { status: 401 });

  try {
    const { productId } = Schema.parse(await req.json());
    const item = await prisma.wishlistItem.upsert({
      where: { customerId_productId: { customerId: customer.id, productId } },
      update: {},
      create: { customerId: customer.id, productId },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  try {
    const { productId } = Schema.parse(await req.json());
    await prisma.wishlistItem.deleteMany({ where: { customerId: customer.id, productId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
