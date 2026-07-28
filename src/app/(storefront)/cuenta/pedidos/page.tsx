import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import EmptyState from "@/components/storefront/EmptyState";
import { getCustomerSession } from "@/lib/auth/customer";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending Payment",
  PAYMENT_VERIFICATION: "Payment Under Review",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export default async function OrdersPage() {
  const customer = await getCustomerSession();
  if (!customer) redirect("/cuenta/iniciar-sesion");

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-3xl text-ivory mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <EmptyState
            locale="en"
            title={{ en: "No orders yet", es: "Aún no hay pedidos" }}
            description={{
              en: "When you place an order, it will show up here with real-time status.",
              es: "Cuando hagas un pedido, aparecerá aquí con su estado en tiempo real.",
            }}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/cuenta/pedidos/${order.orderNumber}`}
                className="block rounded-lg border border-white/10 p-5 hover:border-gold transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-ivory">{order.orderNumber}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-ivory/60">
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
                <p className="text-xs text-ivory/40 mb-1">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="font-mono text-gold text-sm">{formatPrice(Number(order.total))}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
