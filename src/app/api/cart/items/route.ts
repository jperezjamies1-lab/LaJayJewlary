import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOrCreateCart, setCartCookie } from "@/lib/cart";

const Schema = z.object({
  productId: z.string(),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().positive().default(1),
});

export async function POST(req: NextRequest) {
  try {
    const { productId, variantId, quantity } = Schema.parse(await req.json());

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });
    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json({ error: "This product is not available." }, { status: 404 });
    }
    if (product.inventory && product.inventory.stock < quantity) {
      return NextResponse.json(
        { error: `Only ${product.inventory.stock} left in stock.` },
        { status: 409 }
      );
    }

    const cart = await getOrCreateCart();

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId,
          variantId: variantId ?? null,
        },
      },
    }).catch(() => null); // composite unique with a null column needs a fallback lookup on some DBs

    const item = existing
      ? await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
        })
      : await prisma.cartItem.create({
          data: { cartId: cart.id, productId, variantId: variantId ?? undefined, quantity },
        });

    const res = NextResponse.json({ item }, { status: 201 });
    if (cart.sessionId) setCartCookie(res, cart.sessionId);
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not add item to cart" }, { status: 500 });
  }
}
