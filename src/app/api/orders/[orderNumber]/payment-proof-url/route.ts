import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth/customer";
import { getAdminSession } from "@/lib/auth/admin";
import { getSignedPaymentProofUrl } from "@/lib/storage/supabase";

// Reads the session cookie (admin or customer) — never statically rendered/cached.
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findUnique({ where: { orderNumber: params.orderNumber } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!order.paymentScreenshotUrl) {
    return NextResponse.json({ error: "No payment proof on this order." }, { status: 404 });
  }

  const admin = await getAdminSession();
  const customer = admin ? null : await getCustomerSession();

  const authorized = !!admin || (!!customer && customer.id === order.customerId);
  if (!authorized) {
    return NextResponse.json({ error: "Not authorized to view this file." }, { status: 403 });
  }

  try {
    const signedUrl = await getSignedPaymentProofUrl(order.paymentScreenshotUrl, 300);
    return NextResponse.json({ url: signedUrl, expiresIn: 300 });
  } catch (err) {
    console.error("Signed URL generation failed:", err);
    return NextResponse.json({ error: "Could not generate a viewing link." }, { status: 500 });
  }
}
