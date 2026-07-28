import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/log";

const Schema = z.object({ token: z.string().min(1), password: z.string().min(8) });

export async function POST(req: NextRequest) {
  try {
    const { token, password } = Schema.parse(await req.json());

    const customer = await prisma.customer.findUnique({ where: { resetToken: token } });
    if (!customer || !customer.resetTokenExpires || customer.resetTokenExpires < new Date()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.customer.update({
      where: { id: customer.id },
      data: { passwordHash, resetToken: null, resetTokenExpires: null },
    });

    await logActivity({ category: "SECURITY", action: "PASSWORD_RESET_COMPLETED", entity: "Customer", entityId: customer.id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
