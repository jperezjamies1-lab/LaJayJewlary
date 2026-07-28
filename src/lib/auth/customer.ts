import { cookies } from "next/headers";
import { signJwt, verifyJwt } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export const CUSTOMER_COOKIE = "jay_customer_session";

export async function getCustomerSession() {
  const token = cookies().get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;

  let payload: { sub: string };
  try {
    payload = await verifyJwt<{ sub: string }>(token);
  } catch {
    return null;
  }

  const customer = await prisma.customer.findUnique({ where: { id: payload.sub } });
  if (!customer || customer.blocked) return null;
  return customer;
}

export async function signCustomerToken(customerId: string) {
  return signJwt({ sub: customerId }, "30d");
}
