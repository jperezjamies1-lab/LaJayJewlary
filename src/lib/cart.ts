import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth/customer";

export const CART_COOKIE = "jay_cart_session";

/**
 * Returns the current cart, creating one if needed. Logged-in customers get
 * a cart tied to their customerId; guests get one tied to an httpOnly cookie
 * token. This is a real, persisted cart — not client-only React state.
 */
export async function getOrCreateCart() {
  const customer = await getCustomerSession();

  if (customer) {
    const existing = await prisma.cart.findUnique({ where: { customerId: customer.id } });
    if (existing) return existing;
    return prisma.cart.create({ data: { customerId: customer.id } });
  }

  const cookieStore = cookies();
  let token = cookieStore.get(CART_COOKIE)?.value;

  if (token) {
    const existing = await prisma.cart.findUnique({ where: { sessionId: token } });
    if (existing) return existing;
  }

  token = crypto.randomBytes(24).toString("hex");
  const cart = await prisma.cart.create({ data: { sessionId: token } });
  return cart;
}

export function setCartCookie(res: { cookies: { set: (name: string, value: string, opts: object) => void } }, token: string) {
  res.cookies.set(CART_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}
