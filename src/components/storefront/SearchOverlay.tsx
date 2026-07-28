"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.products ?? []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[60] bg-onyx/95 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 pt-20">
        <div className="flex items-center gap-3 border-b border-white/20 pb-4">
          <Search size={20} className="text-gold" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rings, necklaces, materials…"
            className="flex-1 bg-transparent text-xl text-ivory outline-none placeholder:text-ivory/30"
          />
          <button onClick={onClose} aria-label="Close search" className="text-ivory/50 hover:text-ivory">
            <X size={22} />
          </button>
        </div>

        <div className="mt-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {loading && <p className="text-ivory/30 text-sm">Searching…</p>}
          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="text-ivory/30 text-sm">No results for "{query}"</p>
          )}
          {results.map((p) => (
            <Link
              key={p.id}
              href={`/producto/${p.slug}`}
              onClick={onClose}
              className="flex items-center gap-4 p-2 rounded-md hover:bg-white/5"
            >
              <div className="relative w-14 h-14 shrink-0 rounded-md overflow-hidden bg-onyx2">
                {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-ivory/90">{p.name}</p>
                <p className="font-mono text-xs text-gold">{formatPrice(p.salePrice ?? p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
