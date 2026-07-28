import { redirect } from "next/navigation";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import ProductCard from "@/components/storefront/ProductCard";
import EmptyState from "@/components/storefront/EmptyState";
import { getCustomerSession } from "@/lib/auth/customer";
import { prisma } from "@/lib/db";
import { serializeProduct } from "@/lib/serializers";

export default async function WishlistPage() {
  const customer = await getCustomerSession();
  if (!customer) redirect("/cuenta/iniciar-sesion");

  const items = await prisma.wishlistItem.findMany({
    where: { customerId: customer.id },
    include: { product: { include: { images: true, collection: true } } },
  });

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="font-display text-3xl text-ivory mb-8">Wishlist</h1>
        {items.length === 0 ? (
          <EmptyState
            locale="en"
            title={{ en: "Nothing saved yet", es: "Nada guardado aún" }}
            description={{
              en: "Tap the heart on any product to save it here.",
              es: "Toca el corazón en cualquier producto para guardarlo aquí.",
            }}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((i) => (
              <ProductCard key={i.id} product={serializeProduct(i.product as any)} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
