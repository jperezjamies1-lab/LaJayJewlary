import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth/customer";
import { uploadPaymentProof } from "@/lib/storage/supabase";
import { logActivity } from "@/lib/log";

export const runtime = "nodejs";

// Per spec: payment screenshots are JPEG/PNG/WebP only, no PDF.
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

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
    return NextResponse.json({ error: "Please upload a JPG, PNG, or WebP image." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds the 8MB limit." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Stored in the private payment-proofs bucket. `paymentScreenshotUrl`
  // holds a Storage *path*, not a public URL — the bucket is private, so
  // viewing it always goes through /api/orders/[orderNumber]/payment-proof-url
  // to mint a short-lived signed URL for an authorized viewer.
  const { path } = await uploadPaymentProof({
    orderNumber: order.orderNumber,
    fileName: file.name,
    body: buffer,
    contentType: file.type,
  });

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { paymentScreenshotUrl: path, status: "PAYMENT_VERIFICATION" },
  });

  await logActivity({
    category: "ORDER",
    action: "PAYMENT_SCREENSHOT_UPLOADED",
    entity: "Order",
    entityId: order.id,
  });

  return NextResponse.json({ order: { status: updated.status } });
}
