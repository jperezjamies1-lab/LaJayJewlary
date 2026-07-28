import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";
import { logActivity } from "@/lib/log";
import { sendEmail, paymentReceivedEmail, orderShippedEmail } from "@/lib/email";

const Schema = z.object({
  status: z
    .enum(["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"])
    .optional(),
  paymentVerified: z.boolean().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const session = await requireAdmin("orders.write");
    const body = Schema.parse(await req.json());

    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: { items: true, customer: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const data: Record<string, unknown> = { ...body };

    // Approving payment moves PAYMENT_VERIFICATION -> CONFIRMED automatically
    // unless the admin explicitly set a different status.
    if (body.paymentVerified && !body.status && order.status === "PAYMENT_VERIFICATION") {
      data.status = "CONFIRMED";
    }

    // Releasing reserved stock and decrementing real stock happens exactly
    // once, at the moment an order is cancelled/refunded or confirmed.
    if (body.status === "CANCELLED" || body.status === "REFUNDED") {
      await Promise.all(
        order.items.map((i) =>
          prisma.inventoryRecord.updateMany({
            where: { productId: i.productId },
            data: { reserved: { decrement: i.quantity } },
          })
        )
      );
    }
    if (data.status === "CONFIRMED" && order.status !== "CONFIRMED") {
      await Promise.all(
        order.items.map((i) =>
          prisma.inventoryRecord.updateMany({
            where: { productId: i.productId },
            data: { stock: { decrement: i.quantity }, reserved: { decrement: i.quantity } },
          })
        )
      );
    }

    const updated = await prisma.order.update({ where: { id: order.id }, data });

    try {
      const locale = order.customer.language as "en" | "es";
      if (data.status === "CONFIRMED" && order.status !== "CONFIRMED") {
        const { subject, html } = paymentReceivedEmail(locale, order.orderNumber);
        await sendEmail({ to: order.customer.email, subject, html });
      }
      if (body.trackingNumber && data.status === "SHIPPED") {
        const { subject, html } = orderShippedEmail(locale, order.orderNumber, body.trackingNumber);
        await sendEmail({ to: order.customer.email, subject, html });
      }
    } catch (e) {
      console.error("Order status email not sent:", e);
    }

    await logActivity({
      category: "ORDER",
      action: `STATUS_${updated.status}`,
      adminId: session.id,
      entity: "Order",
      entityId: order.id,
    });

    return NextResponse.json({ order: updated });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
