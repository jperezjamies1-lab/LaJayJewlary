import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/log";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

// Simple in-memory rate limiter for local/dev use.
// In production, replace with a durable store (Redis) keyed by IP + email.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const { email, password, remember } = await req.json();
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const key = `${ip}:${email}`;

  const record = attempts.get(key);
  const now = Date.now();
  if (record && record.resetAt > now && record.count >= MAX_ATTEMPTS) {
    await logActivity({ category: "SECURITY", action: "ADMIN_LOGIN_RATE_LIMITED", ipAddress: ip });
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const admin = await prisma.admin.findUnique({ where: { email }, include: { role: true } });
  const valid = admin && (await bcrypt.compare(password, admin.passwordHash));

  if (!valid) {
    attempts.set(key, {
      count: (record?.resetAt ?? 0) > now ? record!.count + 1 : 1,
      resetAt: now + WINDOW_MS,
    });
    await logActivity({ category: "LOGIN", action: "ADMIN_LOGIN_FAILED", ipAddress: ip, entity: "Admin", entityId: email });
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  attempts.delete(key);

  const token = jwt.sign(
    { sub: admin.id, role: admin.role.name },
    JWT_SECRET,
    { expiresIn: remember ? "30d" : "12h" }
  );

  const res = NextResponse.json({ ok: true });
  res.cookies.set("jay_admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12,
    path: "/",
  });

  await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  await logActivity({ category: "LOGIN", action: "ADMIN_LOGIN_SUCCESS", adminId: admin.id, ipAddress: ip });

  return res;
}
