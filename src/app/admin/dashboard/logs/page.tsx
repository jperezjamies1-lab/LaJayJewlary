import { prisma } from "@/lib/db";
import LogsViewer from "@/components/admin/LogsViewer";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const serialized = logs.map((l) => ({
    id: l.id,
    action: l.action,
    entity: l.entity,
    entityId: l.entityId,
    ipAddress: l.ipAddress,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Activity Logs</h1>
      <LogsViewer initial={serialized} />
    </div>
  );
}
