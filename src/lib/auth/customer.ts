import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
export const CUSTOMER_COOKIE = "jay_customer_session";

export async function getCustomerSession() {
  const token = cookies().get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;

  let payload: { sub: string };
  try {
    payload = jwt.verify(token, JWT_SECRET) as { sub: string };
  } catch {
    return null;
  }

  const customer = await prisma.customer.findUnique({ where: { id: payload.sub } });
  if (!customer || customer.blocked) return null;
  return customer;
}

export function signCustomerToken(customerId: string) {
  return jwt.sign({ sub: customerId }, JWT_SECRET, { expiresIn: "30d" });
}
