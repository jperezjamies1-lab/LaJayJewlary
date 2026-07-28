import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-white/10 text-ivory/60",
  PAYMENT_VERIFICATION: "bg-gold/10 text-gold",
  CONFIRMED: "bg-success/10 text-success",
  PROCESSING: "bg-success/10 text-success",
  SHIPPED: "bg-blue-400/10 text-blue-400",
  DELIVERED: "bg-success/10 text-success",
  CANCELLED: "bg-garnet/20 text-garnet",
  REFUNDED: "bg-garnet/20 text-garnet",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Orders</h1>
        <a
          href="/api/admin/orders/export"
          className="rounded-md border border-white/10 px-4 py-2.5 text-sm text-ivory/70 hover:border-gold hover:text-gold"
        >
          Export CSV
        </a>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-white/10 py-16 text-center text-ivory/40 text-sm">
          No orders yet.
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-ivory/40 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-normal">Order</th>
                <th className="text-left px-4 py-3 font-normal">Customer</th>
                <th className="text-left px-4 py-3 font-normal">Items</th>
                <th className="text-left px-4 py-3 font-normal">Total</th>
                <th className="text-left px-4 py-3 font-normal">Payment</th>
                <th className="text-left px-4 py-3 font-normal">Status</th>
                <th className="text-left px-4 py-3 font-normal">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/dashboard/pedidos/${o.orderNumber}`} className="font-mono text-gold hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ivory/80">{o.customer.name ?? o.customer.email}</td>
                  <td className="px-4 py-3 text-ivory/50">{o.items.length}</td>
                  <td className="px-4 py-3 font-mono text-ivory/90">{formatPrice(Number(o.total))}</td>
                  <td className="px-4 py-3">
                    {o.paymentVerified ? (
                      <span className="text-success text-xs">Verified</span>
                    ) : (
                      <span className="text-ivory/40 text-xs">Unverified</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[o.status]}`}>
                      {o.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ivory/40 text-xs">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
