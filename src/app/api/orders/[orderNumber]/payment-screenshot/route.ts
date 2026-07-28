import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth/customer";
import { uploadToR2 } from "@/lib/storage/r2";
import { logActivity } from "@/lib/log";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const order = await prisma.order.findUnique({ where: { orderNumber: params.orderNumber } });
  if (!order || order.customerId !== customer.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "This order is no longer waiting on payment proof." }, { status: 409 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Please upload a JPG, PNG, or PDF." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 10MB limit." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `payment-proofs/${order.orderNumber}-${Date.now()}`;
  const url = await uploadToR2({ key, body: buffer, contentType: file.type });

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { paymentScreenshotUrl: url, status: "PAYMENT_VERIFICATION" },
  });

  await logActivity({
    category: "ORDER",
    action: "PAYMENT_SCREENSHOT_UPLOADED",
    entity: "Order",
    entityId: order.id,
  });

  return NextResponse.json({ order: { status: updated.status, paymentScreenshotUrl: url } });
}
