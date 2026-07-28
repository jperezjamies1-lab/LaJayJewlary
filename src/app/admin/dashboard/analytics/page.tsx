import { prisma } from "@/lib/db";
import StatCard from "@/components/admin/StatCard";
import { DollarSign, ShoppingBag, Users, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

function startOf(period: "day" | "week" | "month" | "year") {
  const now = new Date();
  if (period === "day") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(now.getFullYear(), 0, 1);
}

const PAID_STATUSES = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

async function revenueSince(date: Date) {
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: date }, status: { in: [...PAID_STATUSES] } },
    select: { total: true },
  });
  return orders.reduce((sum, o) => sum + Number(o.total), 0);
}

export default async function AdminAnalyticsPage() {
  const [
    revenueToday,
    revenueWeek,
    revenueMonth,
    revenueYear,
    ordersTotal,
    customersTotal,
    aiConversations,
    aiResolved,
    topProductRows,
  ] = await Promise.all([
    revenueSince(startOf("day")),
    revenueSince(startOf("week")),
    revenueSince(startOf("month")),
    revenueSince(startOf("year")),
    prisma.order.count({ where: { status: { in: [...PAID_STATUSES] } } }),
    prisma.customer.count(),
    prisma.aiConversation.count(),
    prisma.aiConversation.count({ where: { resolved: true } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const topProducts = await Promise.all(
    topProductRows.map(async (row) => {
      const product = await prisma.product.findUnique({ where: { id: row.productId } });
      return { name: product?.name ?? "Unknown", qty: row._sum.quantity ?? 0 };
    })
  );

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Revenue Today" value={formatPrice(revenueToday)} icon={DollarSign} />
        <StatCard label="Revenue This Week" value={formatPrice(revenueWeek)} icon={DollarSign} />
        <StatCard label="Revenue This Month" value={formatPrice(revenueMonth)} icon={DollarSign} />
        <StatCard label="Revenue This Year" value={formatPrice(revenueYear)} icon={DollarSign} />
        <StatCard label="Paid Orders" value={String(ordersTotal)} icon={ShoppingBag} />
        <StatCard label="Total Customers" value={String(customersTotal)} icon={Users} />
        <StatCard label="AI Conversations" value={String(aiConversations)} icon={MessageCircle} />
        <StatCard label="AI Resolved" value={String(aiResolved)} icon={MessageCircle} />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 mb-6">
        <h2 className="text-sm text-ivory/80 mb-4">Best Selling Products</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-ivory/40">No sales yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {topProducts.map((p) => (
              <li key={p.name} className="flex justify-between text-ivory/70">
                <span>{p.name}</span>
                <span className="font-mono text-gold">{p.qty} sold</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-ivory/30 max-w-xl">
        Visitor counts, conversion rate, and traffic-source breakdowns require a page-view event
        pipeline that isn't wired in yet — those numbers are intentionally left out rather than
        estimated. Everything shown above comes directly from the Order, Customer, and
        AiConversation tables.
      </p>
    </div>
  );
}
