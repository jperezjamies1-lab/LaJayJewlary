import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";
import { deletePublicMedia, pathFromPublicUrl } from "@/lib/storage/supabase";
import { logActivity } from "@/lib/log";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin("media.write");
    const { altText, folder } = await req.json();

    const asset = await prisma.mediaAsset.update({
      where: { id: params.id },
      data: { altText, folder },
    });

    await logActivity({ category: "MEDIA_UPLOAD", action: "RENAME", adminId: session.id, entity: "MediaAsset", entityId: asset.id });

    return NextResponse.json({ asset });
  } catch (err) {
    if (err instanceof AdminAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin("media.write");

    const asset = await prisma.mediaAsset.findUnique({ where: { id: params.id } });
    if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const path = pathFromPublicUrl(asset.url);
    if (path) {
      try {
        await deletePublicMedia(path);
      } catch (e) {
        console.error("Supabase Storage delete failed (continuing to remove DB record):", e);
      }
    }

    await prisma.mediaAsset.delete({ where: { id: params.id } });

    await logActivity({ category: "MEDIA_UPLOAD", action: "DELETE", adminId: session.id, entity: "MediaAsset", entityId: params.id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
