import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import ProductGallery from "@/components/storefront/ProductGallery";
import ProductActions from "@/components/storefront/ProductActions";
import ProductCard from "@/components/storefront/ProductCard";
import AiConciergeWidget from "@/components/ai/AiConciergeWidget";
import { prisma } from "@/lib/db";
import { serializeProduct } from "@/lib/serializers";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return {};
  return {
    title: product.seoTitle ?? `${product.name} | Jay La Joyería`,
    description: product.seoDescription ?? product.description,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: true,
      collection: true,
      variants: true,
      inventory: true,
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!product || product.status === "ARCHIVED") notFound();

  const related = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      id: { not: product.id },
      OR: [{ collectionId: product.collectionId ?? undefined }, { categoryId: product.categoryId ?? undefined }],
    },
    include: { images: true },
    take: 4,
  });

  const serialized = serializeProduct(product as any);
  const inStock = !product.inventory || product.inventory.stock - product.inventory.reserved > 0;
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  return (
    <>
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="grid md:grid-cols-2 gap-10">
          <ProductGallery images={product.images} name={product.name} />

          <div>
            {product.collection && (
              <p className="eyebrow mb-2">{product.collection.name}</p>
            )}
            <h1 className="font-display text-4xl text-ivory mb-3">{product.name}</h1>

            {avgRating !== null && (
              <p className="text-sm text-gold mb-3">
                {"★".repeat(Math.round(avgRating))}
                {"☆".repeat(5 - Math.round(avgRating))}{" "}
                <span className="text-ivory/40">({product.reviews.length} reviews)</span>
              </p>
            )}

            <div className="thread-underline inline-block mb-6">
              <span className="font-mono text-2xl text-gold">
                {formatPrice(serialized.salePrice ?? serialized.price)}
              </span>
              {serialized.salePrice && (
                <span className="ml-3 font-mono text-ivory/40 line-through">
                  {formatPrice(serialized.price)}
                </span>
              )}
            </div>

            <p className="text-ivory/60 text-sm leading-relaxed mb-8">{product.description}</p>

            <ProductActions productId={product.id} inStock={inStock} />

            <dl className="mt-8 space-y-2 text-sm border-t border-white/10 pt-6">
              <div className="flex justify-between">
                <dt className="text-ivory/40">SKU</dt>
                <dd className="font-mono text-ivory/70">{product.sku}</dd>
              </div>
              {product.material && (
                <div className="flex justify-between">
                  <dt className="text-ivory/40">Material</dt>
                  <dd className="text-ivory/70">{product.material}</dd>
                </div>
              )}
              {product.weightGrams && (
                <div className="flex justify-between">
                  <dt className="text-ivory/40">Peso</dt>
                  <dd className="text-ivory/70">{String(product.weightGrams)}g</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {product.reviews.length > 0 && (
          <div className="mt-16 border-t border-white/10 pt-10">
            <h2 className="font-display text-2xl text-ivory mb-6">Reseñas</h2>
            <div className="space-y-6 max-w-2xl">
              {product.reviews.map((r) => (
                <div key={r.id} className="border-b border-white/5 pb-6">
                  <p className="text-gold text-sm mb-1">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </p>
                  {r.title && <p className="text-ivory/90 text-sm font-medium mb-1">{r.title}</p>}
                  <p className="text-ivory/60 text-sm">{r.body}</p>
                  {r.verified && <p className="text-[11px] text-success mt-2">Compra Verificada</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-16 border-t border-white/10 pt-10">
            <h2 className="font-display text-2xl text-ivory mb-6">También Te Puede Gustar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={serializeProduct(p as any)} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
      <AiConciergeWidget />
    </>
  );
}
