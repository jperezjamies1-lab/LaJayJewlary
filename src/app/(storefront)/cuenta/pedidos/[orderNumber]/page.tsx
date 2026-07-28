import { notFound, redirect } from "next/navigation";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import OrderStatusPanel from "@/components/storefront/OrderStatusPanel";
import { getCustomerSession } from "@/lib/auth/customer";
import { prisma } from "@/lib/db";

export default async function AccountOrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const customer = await getCustomerSession();
  if (!customer) redirect("/cuenta/iniciar-sesion");

  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: { include: { product: { include: { images: true } } } } },
  });

  if (!order || order.customerId !== customer.id) notFound();

  return (
    <>
      <Header />
      <div className="max-w-xl mx-auto px-4 py-16">
        <h1 className="font-display text-3xl text-ivory mb-8">Order {order.orderNumber}</h1>
        <OrderStatusPanel
          order={{
            orderNumber: order.orderNumber,
            status: order.status,
            subtotal: Number(order.subtotal),
            shipping: Number(order.shipping),
            discount: Number(order.discount),
            total: Number(order.total),
            paymentVerified: order.paymentVerified,
            hasPaymentProof: !!order.paymentScreenshotUrl,
            trackingNumber: order.trackingNumber,
            createdAt: order.createdAt.toISOString(),
            items: order.items.map((i) => ({
              name: i.product.name,
              image: i.product.images[0]?.url,
              quantity: i.quantity,
              price: Number(i.price),
            })),
          }}
        />
      </div>
      <Footer />
    </>
  );
}
