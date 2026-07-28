import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/log";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/cuenta?verified=0`);
  }

  const customer = await prisma.customer.findUnique({ where: { verificationToken: token } });
  if (!customer) {
    return NextResponse.redirect(`${siteUrl}/cuenta?verified=0`);
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: { emailVerified: true, verificationToken: null },
  });

  await logActivity({ category: "CUSTOMER", action: "EMAIL_VERIFIED", entity: "Customer", entityId: customer.id });

  return NextResponse.redirect(`${siteUrl}/cuenta?verified=1`);
}
