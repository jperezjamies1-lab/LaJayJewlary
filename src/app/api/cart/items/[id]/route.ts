import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart";

async function assertOwnership(itemId: string) {
  const cart = await getOrCreateCart();
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.cartId !== cart.id) return null;
  return item;
}

const UpdateSchema = z.object({ quantity: z.number().int().min(1) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const item = await assertOwnership(params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const { quantity } = UpdateSchema.parse(await req.json());
    const updated = await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const item = await assertOwnership(params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.cartItem.delete({ where: { id: item.id } });
  return NextResponse.json({ ok: true });
}
