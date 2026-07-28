import Link from "next/link";
import { DollarSign, ShoppingBag, AlertTriangle, MessageCircle } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const QUICK_ACTIONS = [
  { label: "Add Product", href: "/admin/dashboard/productos/nuevo" },
  { label: "Schedule Live", href: "/admin/dashboard/live" },
  { label: "Create Discount", href: "/admin/dashboard/descuentos" },
  { label: "Upload Media", href: "/admin/dashboard/media" },
];

const PAID_STATUSES = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export default async function AdminDashboardHome() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [todayOrders, pendingReview, inventoryRecords, aiToday, aiResolvedToday, topProductRows, recentAi] =
    await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: startOfToday }, status: { in: [...PAID_STATUSES] } },
        select: { total: true },
      }),
      prisma.order.count({ where: { status: "PAYMENT_VERIFICATION" } }),
      prisma.inventoryRecord.findMany({ select: { stock: true, lowStockAt: true } }),
      prisma.aiConversation.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.aiConversation.count({ where: { createdAt: { gte: startOfToday }, resolved: true } }),
      prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 3 }),
      prisma.aiConversation.findMany({
        where: { createdAt: { gte: startOfToday } },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { messages: { take: 1, orderBy: { createdAt: "asc" } } },
      }),
    ]);

  const lowStock = inventoryRecords.filter((r) => r.stock <= r.lowStockAt).length;

  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const topProducts = await Promise.all(
    topProductRows.map(async (row) => {
      const product = await prisma.product.findUnique({ where: { id: row.productId } });
      return { name: product?.name ?? "—", price: product ? formatPrice(Number(product.price)) : "—", sold: row._sum.quantity ?? 0 };
    })
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-ivory/40 mb-1">Hoy</p>
          <h1 className="font-display text-3xl">Dashboard</h1>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-ivory/70 hover:border-gold hover:text-gold transition-colors"
          >
            + {action.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Today's Revenue" value={formatPrice(todayRevenue)} icon={DollarSign} />
        <StatCard label="Payments Awaiting Review" value={String(pendingReview)} icon={ShoppingBag} />
        <StatCard label="Low Inventory" value={String(lowStock)} icon={AlertTriangle} />
        <StatCard label="AI Conversations Today" value={`${aiToday} (${aiResolvedToday} resolved)`} icon={MessageCircle} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm text-ivory/80 mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-ivory/40">No sales yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {topProducts.map((p) => (
                <li key={p.name} className="flex justify-between text-ivory/70">
                  <span>{p.name}</span>
                  <span className="font-mono text-gold">{p.price}</span>
                  <span className="text-ivory/40">{p.sold} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm text-ivory/80 mb-4">Recent AI Conversations</h2>
          {recentAi.length === 0 ? (
            <p className="text-sm text-ivory/40">No conversations today yet.</p>
          ) : (
            <ul className="space-y-3 text-sm text-ivory/60">
              {recentAi.map((c) => (
                <li key={c.id}>
                  {c.escalated ? "⚠️ " : "💬 "}
                  {c.messages[0]?.content.slice(0, 60) ?? "(no message)"}
                  {c.escalated ? " — escalated" : c.resolved ? " — resolved" : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
