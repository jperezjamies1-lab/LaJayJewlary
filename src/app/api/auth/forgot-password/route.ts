import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail, passwordResetEmail } from "@/lib/email";
import { logActivity } from "@/lib/log";

const Schema = z.object({ email: z.string().email(), language: z.enum(["en", "es"]).default("en") });

export async function POST(req: NextRequest) {
  try {
    const { email, language } = Schema.parse(await req.json());
    const customer = await prisma.customer.findUnique({ where: { email } });

    // Always return success — never leak whether an email is registered.
    if (customer) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
      await prisma.customer.update({
        where: { id: customer.id },
        data: { resetToken, resetTokenExpires },
      });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const resetUrl = `${siteUrl}/cuenta/restablecer?token=${resetToken}`;

      try {
        const { subject, html } = passwordResetEmail(language, resetUrl);
        await sendEmail({ to: email, subject, html });
      } catch (e) {
        console.error("Password reset email not sent:", e);
      }

      await logActivity({ category: "SECURITY", action: "PASSWORD_RESET_REQUESTED", entity: "Customer", entityId: customer.id });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
