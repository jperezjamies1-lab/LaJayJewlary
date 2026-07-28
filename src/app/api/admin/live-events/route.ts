import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";
import { logActivity } from "@/lib/log";

export async function GET() {
  const events = await prisma.liveShoppingEvent.findMany({ orderBy: { scheduledAt: "desc" } });
  return NextResponse.json({ events });
}

const Schema = z.object({
  title: z.string().min(1),
  scheduledAt: z.string(),
  depositAmount: z.number().min(0),
  rules: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin("live.write");
    const body = Schema.parse(await req.json());

    const event = await prisma.liveShoppingEvent.create({
      data: {
        title: body.title,
        scheduledAt: new Date(body.scheduledAt),
        depositAmount: body.depositAmount,
        rules: body.rules,
      },
    });

    await logActivity({ category: "SETTINGS", action: "LIVE_EVENT_CREATED", adminId: session.id, entity: "LiveShoppingEvent", entityId: event.id });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    if (err instanceof AdminAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid event data" }, { status: 400 });
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
