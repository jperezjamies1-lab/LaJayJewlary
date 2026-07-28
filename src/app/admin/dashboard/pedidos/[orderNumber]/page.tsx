import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminOrderActions from "@/components/admin/AdminOrderActions";
import { formatPrice } from "@/lib/utils";

export default async function AdminOrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { customer: true, items: { include: { product: true } } },
  });

  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-1">{order.orderNumber}</h1>
      <p className="text-ivory/40 text-sm mb-8">
        Placed {new Date(order.createdAt).toLocaleString()} by {order.customer.name ?? order.customer.email}
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="rounded-lg border border-white/10 p-5">
          <p className="eyebrow mb-3">Customer</p>
          <p className="text-sm text-ivory/80">{order.customer.name ?? "—"}</p>
          <p className="text-sm text-ivory/50">{order.customer.email}</p>
          <p className="text-sm text-ivory/50">{order.customer.phone ?? ""}</p>
        </div>
        <div className="rounded-lg border border-white/10 p-5">
          <p className="eyebrow mb-3">Shipping Address</p>
          {order.shippingAddressJson ? (
            <div className="text-sm text-ivory/70 space-y-0.5">
              {Object.values(order.shippingAddressJson as Record<string, string>)
                .filter(Boolean)
                .map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
            </div>
          ) : (
            <p className="text-sm text-ivory/40">No address on file</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 p-5 mb-6">
        <p className="eyebrow mb-3">Payment</p>
        <p className="text-sm text-ivory/70 mb-2">Method: {order.paymentMethod ?? "—"}</p>
        {order.paymentScreenshotUrl ? (
          <a
            href={order.paymentScreenshotUrl}
            target="_blank"
            rel="noreferrer"
            className="text-gold text-sm underline"
          >
            View payment screenshot →
          </a>
        ) : (
          <p className="text-sm text-ivory/40">No payment screenshot uploaded yet.</p>
        )}
      </div>

      <div className="rounded-lg border border-white/10 p-5 mb-6">
        <p className="eyebrow mb-3">Items</p>
        <div className="space-y-2">
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm">
              <span className="text-ivory/70">
                {i.product.name} × {i.quantity}
              </span>
              <span className="font-mono text-ivory/90">{formatPrice(Number(i.price) * i.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-3 pt-3 flex justify-between text-gold">
          <span>Total</span>
          <span className="font-mono">{formatPrice(Number(order.total))}</span>
        </div>
      </div>

      <AdminOrderActions
        orderNumber={order.orderNumber}
        status={order.status}
        paymentVerified={order.paymentVerified}
        trackingNumber={order.trackingNumber}
        notes={order.notes}
      />
    </div>
  );
}
