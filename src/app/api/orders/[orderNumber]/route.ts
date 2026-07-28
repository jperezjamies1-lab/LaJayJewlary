import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth/customer";

export async function GET(_req: NextRequest, { params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: { include: { product: { include: { images: true } } } }, customer: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Only the order's own customer (or an authenticated admin, handled separately
  // under /admin) can view it — order number alone isn't a public key.
  const customer = await getCustomerSession();
  if (!customer || customer.id !== order.customerId) {
    return NextResponse.json({ error: "Not authorized to view this order" }, { status: 403 });
  }

  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      discount: Number(order.discount),
      total: Number(order.total),
      paymentVerified: order.paymentVerified,
      hasPaymentProof: !!order.paymentScreenshotUrl,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        name: i.product.name,
        image: i.product.images[0]?.url,
        quantity: i.quantity,
        price: Number(i.price),
      })),
    },
  });
}
