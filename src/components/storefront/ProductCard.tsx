import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export default function ProductCard({
  product,
  locale = "en",
}: {
  product: Product;
  locale?: "en" | "es";
}) {
  const onSale = !!product.salePrice && product.salePrice < product.price;

  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-onyx2 rounded-sm">
        {product.images[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].altText ?? product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ivory/20 text-sm">
            {locale === "en" ? "No image" : "Sin imagen"}
          </div>
        )}
        {onSale && (
          <span className="absolute top-3 left-3 bg-pink text-ivory text-[10px] tracking-widest uppercase px-2 py-1 rounded-sm">
            {locale === "en" ? "Sale" : "Oferta"}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm text-ivory/90 font-body">{product.name}</p>
        <div className="mt-1 inline-block thread-underline">
          <span className="font-mono text-sm text-gold">
            {formatPrice(onSale ? product.salePrice! : product.price, locale)}
          </span>
          {onSale && (
            <span className="ml-2 font-mono text-xs text-ivory/40 line-through">
              {formatPrice(product.price, locale)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
