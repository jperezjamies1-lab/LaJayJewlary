import type { Product as PrismaProduct, MediaAsset, Collection } from "@prisma/client";
import type { Product } from "@/types";

type ProductWithRelations = PrismaProduct & {
  images: MediaAsset[];
  collection?: Collection | null;
  reviews?: { rating: number }[];
};

/**
 * Prisma returns Decimal instances and Date objects, neither of which can
 * cross the server -> client component boundary directly. This is the single
 * place that shape gets normalized so every page does it the same way.
 */
export function serializeProduct(p: ProductWithRelations): Product {
  const reviewCount = p.reviews?.length ?? 0;
  const rating =
    reviewCount > 0
      ? p.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : undefined;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    sku: p.sku,
    material: p.material,
    images: p.images.map((img) => ({ url: img.url, altText: img.altText })),
    collection: p.collection ? { name: p.collection.name, slug: p.collection.slug } : null,
    status: p.status,
    featured: p.featured,
    rating,
    reviewCount,
  };
}
