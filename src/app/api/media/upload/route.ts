import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";
import { uploadPublicMedia } from "@/lib/storage/supabase";
import { logActivity } from "@/lib/log";

export const runtime = "nodejs";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime"]);
const PDF_TYPE = "application/pdf";

const IMAGE_MAX_BYTES = 8 * 1024 * 1024; // 8MB, per spec
const VIDEO_MAX_BYTES = 50 * 1024 * 1024; // videos aren't covered by the 8MB image/screenshot spec; kept generous but bounded
const PDF_MAX_BYTES = 8 * 1024 * 1024;

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

    let maxBytes: number;
    let mediaType: "IMAGE" | "VIDEO" | "PDF";
    if (IMAGE_TYPES.has(file.type)) {
      maxBytes = IMAGE_MAX_BYTES;
      mediaType = "IMAGE";
    } else if (VIDEO_TYPES.has(file.type)) {
      maxBytes = VIDEO_MAX_BYTES;
      mediaType = "VIDEO";
    } else if (file.type === PDF_TYPE) {
      maxBytes = PDF_MAX_BYTES;
      mediaType = "PDF";
    } else {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF, MP4, MOV, PDF.` },
        { status: 415 }
      );
    }

    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File exceeds the ${Math.round(maxBytes / (1024 * 1024))}MB limit for this type.` },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { publicUrl } = await uploadPublicMedia({
      folder: folder.toLowerCase(),
      fileName: file.name,
      body: buffer,
      contentType: file.type,
    });

    const asset = await prisma.mediaAsset.create({
      data: { url: publicUrl, type: mediaType, folder, productId },
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
