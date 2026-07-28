import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, inventory: true },
  });

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Edit Product</h1>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: String(product.price),
          salePrice: product.salePrice ? String(product.salePrice) : "",
          sku: product.sku,
          material: product.material ?? "",
          status: product.status,
          featured: product.featured,
          initialStock: String(product.inventory?.stock ?? 0),
          images: product.images.map((i) => ({ url: i.url, altText: i.altText ?? undefined })),
        }}
      />
    </div>
  );
}
