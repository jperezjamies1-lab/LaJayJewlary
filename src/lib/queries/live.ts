import { prisma } from "@/lib/db";

export async function getUpcomingLiveEvent() {
  const event = await prisma.liveShoppingEvent.findFirst({
    where: { scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" },
  });
  if (!event) return null;
  return {
    id: event.id,
    title: event.title,
    scheduledAt: event.scheduledAt.toISOString(),
    depositAmount: Number(event.depositAmount),
    bannerUrl: event.bannerUrl,
  };
}
