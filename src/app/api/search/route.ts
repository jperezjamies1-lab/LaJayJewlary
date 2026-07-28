import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeProduct } from "@/lib/serializers";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], collections: [] });
  }

  // Trigram similarity search gives real typo tolerance ("neclace" still
  // finds "necklace"). Requires `CREATE EXTENSION IF NOT EXISTS pg_trgm;`
  // on the database — see prisma/migrations README note. Falls back to a
  // plain ILIKE search if the extension isn't installed yet, so search
  // never breaks, it just degrades gracefully.
  try {
    const products = await prisma.$queryRaw<
      { id: string }[]
    >`SELECT id FROM "Product"
      WHERE status = 'ACTIVE'
        AND (similarity(name, ${q}) > 0.2 OR name ILIKE ${"%" + q + "%"} OR sku ILIKE ${"%" + q + "%"})
      ORDER BY similarity(name, ${q}) DESC
      LIMIT 12`;

    const full = await prisma.product.findMany({
      where: { id: { in: products.map((p) => p.id) } },
      include: { images: true, collection: true },
    });

    const collections = await prisma.collection.findMany({
      where: { visible: true, name: { contains: q, mode: "insensitive" } },
      take: 5,
    });

    return NextResponse.json({
      products: full.map(serializeProduct),
      collections: collections.map((c) => ({ name: c.name, slug: c.slug })),
    });
  } catch (err) {
    // pg_trgm not installed — fall back to a straightforward ILIKE search.
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { images: true, collection: true },
      take: 12,
    });
    return NextResponse.json({ products: products.map(serializeProduct), collections: [] });
  }
}
