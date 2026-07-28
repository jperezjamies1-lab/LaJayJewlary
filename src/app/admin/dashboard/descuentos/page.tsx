import { prisma } from "@/lib/db";
import CouponsManager from "@/components/admin/CouponsManager";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { code: "asc" } });
  const serialized = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: Number(c.value),
    minPurchase: c.minPurchase ? Number(c.minPurchase) : null,
    vipOnly: c.vipOnly,
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    active: c.active,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Discounts</h1>
      <CouponsManager initial={serialized} />
    </div>
  );
}
