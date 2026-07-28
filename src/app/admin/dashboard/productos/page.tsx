import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { serializeProduct } from "@/lib/serializers";
import ProductsTable from "@/components/admin/ProductsTable";

export const dynamic = "force-dynamic"; // admin views always read fresh data

export default async function AdminProductsPage() {
  const raw = await prisma.product.findMany({
    include: { images: true, inventory: true },
    orderBy: { createdAt: "desc" },
  });

  const products = raw.map((p) => ({
    ...serializeProduct(p),
    stock: p.inventory?.stock ?? 0,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Products</h1>
        <Link
          href="/admin/dashboard/productos/nuevo"
          className="flex items-center gap-2 rounded-md bg-gold text-onyx px-4 py-2.5 text-sm font-medium"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <ProductsTable initialProducts={products} />
    </div>
  );
}
