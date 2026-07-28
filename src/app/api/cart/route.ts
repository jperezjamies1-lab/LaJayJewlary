import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateCart, setCartCookie } from "@/lib/cart";
import { serializeProduct } from "@/lib/serializers";

export async function GET() {
  const cart = await getOrCreateCart();
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: { include: { images: true } } },
  });

  const res = NextResponse.json({
    cartId: cart.id,
    items: items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      product: serializeProduct(i.product as any),
    })),
    subtotal: items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),
  });

  if (cart.sessionId) setCartCookie(res, cart.sessionId);
  return res;
}

export async function DELETE() {
  const cart = await getOrCreateCart();
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return NextResponse.json({ ok: true });
}
