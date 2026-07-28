import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin("media.read");
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder");
    const q = searchParams.get("q");

    const assets = await prisma.mediaAsset.findMany({
      where: {
        ...(folder ? { folder } : {}),
        ...(q ? { OR: [{ altText: { contains: q, mode: "insensitive" } }, { url: { contains: q, mode: "insensitive" } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ assets });
  } catch (err) {
    if (err instanceof AdminAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Failed to load media" }, { status: 500 });
  }
}
