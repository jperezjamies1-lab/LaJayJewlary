import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";
import { logActivity } from "@/lib/log";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin("products.write");

    const original = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true },
    });
    if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const copySuffix = `-copy-${Date.now().toString(36)}`;
    const duplicate = await prisma.product.create({
      data: {
        name: `${original.name} (Copy)`,
        slug: `${original.slug}${copySuffix}`,
        description: original.description,
        price: original.price,
        salePrice: original.salePrice,
        sku: `${original.sku}${copySuffix}`,
        barcode: original.barcode,
        material: original.material,
        weightGrams: original.weightGrams,
        brand: original.brand,
        status: "DRAFT",
        featured: false,
        seoTitle: original.seoTitle,
        seoDescription: original.seoDescription,
        collectionId: original.collectionId,
        categoryId: original.categoryId,
        images: {
          create: original.images.map((img) => ({
            url: img.url,
            type: img.type,
            altText: img.altText,
            folder: img.folder,
          })),
        },
      },
    });

    await logActivity({
      category: "PRODUCT",
      action: "DUPLICATE",
      adminId: session.id,
      entity: "Product",
      entityId: duplicate.id,
    });

    return NextResponse.json({ product: duplicate }, { status: 201 });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
