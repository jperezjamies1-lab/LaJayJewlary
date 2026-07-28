import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signCustomerToken, CUSTOMER_COOKIE } from "@/lib/auth/customer";
import { logActivity } from "@/lib/log";

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  try {
    const { email, password } = LoginSchema.parse(await req.json());
    const key = `${ip}:${email}`;
    const now = Date.now();
    const record = attempts.get(key);
    if (record && record.resetAt > now && record.count >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }

    const customer = await prisma.customer.findUnique({ where: { email } });
    const valid = customer?.passwordHash && (await bcrypt.compare(password, customer.passwordHash));

    if (!valid || !customer) {
      attempts.set(key, { count: (record?.resetAt ?? 0) > now ? record!.count + 1 : 1, resetAt: now + WINDOW_MS });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (customer.blocked) {
      return NextResponse.json({ error: "This account has been blocked. Contact support." }, { status: 403 });
    }

    attempts.delete(key);
    await logActivity({ category: "LOGIN", action: "CUSTOMER_LOGIN", entity: "Customer", entityId: customer.id, ipAddress: ip });

    const token = await signCustomerToken(customer.id);
    const res = NextResponse.json({ ok: true, customer: { id: customer.id, name: customer.name, email: customer.email } });
    res.cookies.set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
