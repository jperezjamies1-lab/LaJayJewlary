import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";
import { uploadToR2 } from "@/lib/storage/r2";
import { logActivity } from "@/lib/log";

export const runtime = "nodejs"; // R2 upload needs Node buffers; Edge variant would use streaming instead

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/quicktime",
  "application/pdf",
]);
const MAX_BYTES = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin("media.write");

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "Uploads";
    const productId = (formData.get("productId") as string) || undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 25MB limit" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const key = `${folder.toLowerCase()}/${Date.now()}-${safeName}`;

    const url = await uploadToR2({ key, body: buffer, contentType: file.type });

    const mediaType = file.type.startsWith("video")
      ? "VIDEO"
      : file.type === "application/pdf"
      ? "PDF"
      : "IMAGE";

    const asset = await prisma.mediaAsset.create({
      data: { url, type: mediaType, folder, productId },
    });

    await logActivity({
      category: "MEDIA_UPLOAD",
      action: "UPLOAD",
      adminId: session.id,
      entity: "MediaAsset",
      entityId: asset.id,
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
