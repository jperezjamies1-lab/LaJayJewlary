"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus } from "lucide-react";

export default function ProductActions({ productId, inStock }: { productId: string; inStock: boolean }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  async function addToCart() {
    setLoading(true);
    setError(null);
    setAdded(false);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not add to cart");
      setAdded(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add to cart");
    } finally {
      setLoading(false);
    }
  }

  async function toggleWishlist() {
    const res = await fetch("/api/wishlist", {
      method: wishlisted ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (res.ok) setWishlisted(!wishlisted);
    else if (res.status === 401) router.push("/cuenta/iniciar-sesion");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-white/15 rounded-full">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 text-ivory/60 hover:text-gold">
            <Minus size={14} />
          </button>
          <span className="text-sm text-ivory w-6 text-center">{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} className="p-3 text-ivory/60 hover:text-gold">
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={addToCart}
          disabled={loading || !inStock}
          className="flex-1 rounded-full bg-gold text-onyx py-3 text-sm font-medium disabled:opacity-40"
        >
          {!inStock ? "Sold Out" : loading ? "Adding…" : added ? "Added ✓" : "Add to Cart"}
        </button>

        <button
          onClick={toggleWishlist}
          aria-label="Add to wishlist"
          className="p-3 border border-white/15 rounded-full hover:border-gold"
        >
          <Heart size={16} className={wishlisted ? "fill-garnet text-garnet" : "text-ivory/60"} />
        </button>
      </div>
      {error && <p className="text-xs text-garnet">{error}</p>}
    </div>
  );
}
