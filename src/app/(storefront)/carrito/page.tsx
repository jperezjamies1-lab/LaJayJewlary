"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import EmptyState from "@/components/storefront/EmptyState";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface CartLine {
  id: string;
  quantity: number;
  product: Product;
}

export default function CartPage() {
  const [items, setItems] = useState<CartLine[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/cart");
    const data = await res.json();
    setItems(data.items ?? []);
    setSubtotal(data.subtotal ?? 0);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateQty(id: string, quantity: number) {
    if (quantity < 1) return;
    await fetch(`/api/cart/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/cart/items/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-3xl text-ivory mb-8">Shopping Cart</h1>

        {loading ? (
          <p className="text-ivory/40 text-sm">Loading…</p>
        ) : items.length === 0 ? (
          <EmptyState
            locale="en"
            title={{ en: "Your cart is empty", es: "Tu carrito está vacío" }}
            description={{
              en: "Browse the collection and add a piece you love.",
              es: "Explora la colección y agrega una pieza que te encante.",
            }}
          />
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map((line) => (
                <div key={line.id} className="flex gap-4 border-b border-white/10 pb-4">
                  <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-onyx2">
                    {line.product.images[0] && (
                      <Image src={line.product.images[0].url} alt={line.product.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-ivory/90">{line.product.name}</p>
                    <p className="font-mono text-gold text-sm mt-1">{formatPrice(line.product.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQty(line.id, line.quantity - 1)} className="text-ivory/50 hover:text-gold">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm text-ivory/80 w-6 text-center">{line.quantity}</span>
                      <button onClick={() => updateQty(line.id, line.quantity + 1)} className="text-ivory/50 hover:text-gold">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => remove(line.id)} aria-label="Remove" className="text-ivory/30 hover:text-garnet self-start">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-ivory/60 text-sm">Subtotal</span>
              <span className="font-mono text-xl text-gold">{formatPrice(subtotal)}</span>
            </div>

            <Link
              href="/checkout"
              className="block text-center w-full rounded-md bg-gold text-onyx py-3 text-sm font-medium"
            >
              Proceed to Checkout
            </Link>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
