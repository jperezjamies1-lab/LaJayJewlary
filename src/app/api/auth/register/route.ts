import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signCustomerToken, CUSTOMER_COOKIE } from "@/lib/auth/customer";
import { sendEmail, verificationEmail, welcomeEmail } from "@/lib/email";
import { logActivity } from "@/lib/log";

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  language: z.enum(["en", "es"]).default("en"),
});

export async function POST(req: NextRequest) {
  try {
    const body = RegisterSchema.parse(await req.json());

    const existing = await prisma.customer.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        language: body.language,
        verificationToken,
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const verifyUrl = `${siteUrl}/api/auth/verify-email?token=${verificationToken}`;

    try {
      const { subject, html } = verificationEmail(body.language, verifyUrl);
      await sendEmail({ to: body.email, subject, html });
      const welcome = welcomeEmail(body.language, body.name);
      await sendEmail({ to: body.email, subject: welcome.subject, html: welcome.html });
    } catch (emailErr) {
      // Registration still succeeds even if email delivery isn't configured yet —
      // the account exists and can be verified once RESEND_API_KEY is set.
      console.error("Verification email not sent:", emailErr);
    }

    await logActivity({ category: "CUSTOMER", action: "REGISTER", entity: "Customer", entityId: customer.id });

    const token = signCustomerToken(customer.id);
    const res = NextResponse.json({ ok: true, customer: { id: customer.id, name: customer.name, email: customer.email } }, { status: 201 });
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
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
