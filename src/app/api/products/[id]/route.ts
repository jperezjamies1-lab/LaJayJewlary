import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";
import { logActivity } from "@/lib/log";
import { deletePublicMedia, pathFromPublicUrl } from "@/lib/storage/supabase";
import { z } from "zod";

const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  salePrice: z.number().positive().nullable().optional(),
  sku: z.string().min(1).optional(),
  barcode: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  weightGrams: z.number().nullable().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "HIDDEN", "ARCHIVED", "SOLD_OUT"]).optional(),
  featured: z.boolean().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  collectionId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, variants: true, collection: true, category: true, inventory: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin("products.write");
    const body = UpdateProductSchema.parse(await req.json());

    const product = await prisma.product.update({
      where: { id: params.id },
      data: body,
    });

    await logActivity({
      category: "PRODUCT",
      action: "UPDATE",
      adminId: session.id,
      entity: "Product",
      entityId: product.id,
    });

    return NextResponse.json({ product });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin("products.write");

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Clean up the actual Storage objects before removing the DB rows
    // (MediaAsset rows cascade-delete with the product; the underlying
    // files in public-media do not, so this is done explicitly).
    await Promise.all(
      product.images.map(async (img) => {
        const path = pathFromPublicUrl(img.url);
        if (!path) return;
        try {
          await deletePublicMedia(path);
        } catch (e) {
          console.error("Supabase Storage cleanup failed for", img.url, e);
        }
      })
    );

    await prisma.product.delete({ where: { id: params.id } });

    await logActivity({
      category: "PRODUCT",
      action: "DELETE",
      adminId: session.id,
      entity: "Product",
      entityId: params.id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}

function handleError(err: unknown) {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof z.ZodError) {
    return NextResponse.json({ error: "Invalid input", details: err.flatten() }, { status: 400 });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
