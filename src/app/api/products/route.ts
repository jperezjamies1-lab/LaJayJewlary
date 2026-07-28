import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";
import { logActivity } from "@/lib/log";

// Public storefront read — only ever returns ACTIVE products, real DB only.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const collection = searchParams.get("collection");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const q = searchParams.get("q");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const admin = searchParams.get("admin"); // "1" from the admin dashboard, bypasses ACTIVE-only filter

  let statusFilter: Record<string, unknown> = { status: "ACTIVE" };
  if (admin === "1") {
    try {
      await requireAdmin("products.read");
      statusFilter = {};
    } catch {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
  }

  const products = await prisma.product.findMany({
    where: {
      ...statusFilter,
      ...(collection ? { collection: { slug: collection } } : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(featured ? { featured: true } : {}),
      ...(minPrice ? { price: { gte: Number(minPrice) } } : {}),
      ...(maxPrice ? { price: { lte: Number(maxPrice) } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { images: true, collection: true, inventory: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

const CreateProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().default(""),
  price: z.number().positive(),
  salePrice: z.number().positive().nullable().optional(),
  sku: z.string().min(1),
  material: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "HIDDEN", "ARCHIVED", "SOLD_OUT"]).default("DRAFT"),
  featured: z.boolean().default(false),
  collectionId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  images: z.array(z.object({ url: z.string().url(), altText: z.string().optional() })).default([]),
  initialStock: z.number().int().min(0).default(0),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin("products.write");
    const body = CreateProductSchema.parse(await req.json());

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        salePrice: body.salePrice ?? undefined,
        sku: body.sku,
        material: body.material ?? undefined,
        status: body.status,
        featured: body.featured,
        collectionId: body.collectionId ?? undefined,
        categoryId: body.categoryId ?? undefined,
        images: { create: body.images.map((img) => ({ url: img.url, altText: img.altText })) },
        inventory: { create: { stock: body.initialStock } },
      },
      include: { images: true },
    });

    await logActivity({
      category: "PRODUCT",
      action: "CREATE",
      adminId: session.id,
      entity: "Product",
      entityId: product.id,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: err.flatten() }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
