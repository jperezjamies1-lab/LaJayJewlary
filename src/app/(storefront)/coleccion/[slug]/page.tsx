import { notFound } from "next/navigation";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import ProductCard from "@/components/storefront/ProductCard";
import EmptyState from "@/components/storefront/EmptyState";
import { prisma } from "@/lib/db";
import { serializeProduct } from "@/lib/serializers";

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { min?: string; max?: string; sort?: string };
}) {
  const collection = await prisma.collection.findUnique({ where: { slug: params.slug } });
  if (!collection || !collection.visible) notFound();

  const minPrice = searchParams.min ? Number(searchParams.min) : undefined;
  const maxPrice = searchParams.max ? Number(searchParams.max) : undefined;

  const orderBy =
    searchParams.sort === "price_asc"
      ? { price: "asc" as const }
      : searchParams.sort === "price_desc"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const };

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      collectionId: collection.id,
      ...(minPrice ? { price: { gte: minPrice } } : {}),
      ...(maxPrice ? { price: { lte: maxPrice } } : {}),
    },
    include: { images: true, collection: true },
    orderBy,
  });

  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-10">
          <h1 className="font-display text-4xl text-ivory thread-underline inline-block">{collection.name}</h1>
          {collection.description && <p className="text-ivory/50 mt-4 max-w-xl">{collection.description}</p>}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <a href={`?sort=newest`} className="text-xs border border-white/15 rounded-full px-3 py-1.5 text-ivory/60 hover:border-gold hover:text-gold">
            Newest
          </a>
          <a href={`?sort=price_asc`} className="text-xs border border-white/15 rounded-full px-3 py-1.5 text-ivory/60 hover:border-gold hover:text-gold">
            Price: Low to High
          </a>
          <a href={`?sort=price_desc`} className="text-xs border border-white/15 rounded-full px-3 py-1.5 text-ivory/60 hover:border-gold hover:text-gold">
            Price: High to Low
          </a>
        </div>

        {products.length === 0 ? (
          <EmptyState
            locale="en"
            title={{ en: "No pieces here yet", es: "Aún no hay piezas aquí" }}
            description={{
              en: "This collection is being curated — check back soon.",
              es: "Esta colección está siendo curada — vuelve pronto.",
            }}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={serializeProduct(p as any)} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
