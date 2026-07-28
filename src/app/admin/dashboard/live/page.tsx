import { prisma } from "@/lib/db";
import LiveEventsManager from "@/components/admin/LiveEventsManager";

export const dynamic = "force-dynamic";

export default async function AdminLivePage() {
  const events = await prisma.liveShoppingEvent.findMany({ orderBy: { scheduledAt: "desc" } });
  const serialized = events.map((e) => ({
    id: e.id,
    title: e.title,
    scheduledAt: e.scheduledAt.toISOString(),
    depositAmount: Number(e.depositAmount),
    rules: e.rules,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Live Shopping</h1>
      <LiveEventsManager initial={serialized} />
    </div>
  );
}
