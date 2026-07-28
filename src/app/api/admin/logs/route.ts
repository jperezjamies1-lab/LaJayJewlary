import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin("logs.read");
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");

    const logs = await prisma.activityLog.findMany({
      where: {
        ...(category ? { action: { startsWith: `${category}:` } } : {}),
        ...(q
          ? {
              OR: [
                { action: { contains: q, mode: "insensitive" } },
                { entity: { contains: q, mode: "insensitive" } },
                { entityId: { contains: q, mode: "insensitive" } },
                { ipAddress: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    return NextResponse.json({ logs });
  } catch (err) {
    if (err instanceof AdminAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Failed to load logs" }, { status: 500 });
  }
}
