"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Pencil, EyeOff, Eye, Copy, Trash2, Star } from "lucide-react";
import type { Product } from "@/types";

interface Row extends Product {
  stock: number;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  DRAFT: "bg-white/10 text-ivory/50",
  SOLD_OUT: "bg-garnet/20 text-garnet",
  HIDDEN: "bg-white/10 text-ivory/40",
  ARCHIVED: "bg-white/5 text-ivory/30",
};

export default function ProductsTable({ initialProducts }: { initialProducts: Row[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase())
  );

  async function toggleHidden(p: Row) {
    const nextStatus = p.status === "HIDDEN" ? "ACTIVE" : "HIDDEN";
    await patchProduct(p.id, { status: nextStatus });
  }

  async function toggleFeatured(p: Row) {
    await patchProduct(p.id, { featured: !p.featured });
  }

  async function patchProduct(id: string, data: Record<string, unknown>) {
    setError(null);
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Update failed");
      return;
    }
    startTransition(() => router.refresh());
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...(data as Partial<Row>) } : p))
    );
  }

  async function duplicate(id: string) {
    setError(null);
    const res = await fetch(`/api/products/${id}/duplicate`, { method: "POST" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Duplicate failed");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setError(null);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Delete failed");
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or SKU…"
          className="w-full rounded-md bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      {error && <p className="text-sm text-garnet mb-3">{error}</p>}

      {products.length === 0 ? (
        <div className="rounded-xl border border-white/10 py-16 text-center text-ivory/40 text-sm">
          No products yet. Click "Add Product" to create your first listing.
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-ivory/40 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-normal">Product</th>
                <th className="text-left px-4 py-3 font-normal">SKU</th>
                <th className="text-left px-4 py-3 font-normal">Price</th>
                <th className="text-left px-4 py-3 font-normal">Stock</th>
                <th className="text-left px-4 py-3 font-normal">Status</th>
                <th className="text-right px-4 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-ivory/90 flex items-center gap-2">
                    {p.featured && <Star size={12} className="text-gold fill-gold" />}
                    {p.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-ivory/50">{p.sku}</td>
                  <td className="px-4 py-3 font-mono text-gold">${p.price}</td>
                  <td className="px-4 py-3 text-ivory/70">
                    {p.stock === 0 ? <span className="text-garnet">0</span> : p.stock}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3 text-ivory/40">
                      <Link href={`/admin/dashboard/productos/${p.id}`} aria-label="Edit" className="hover:text-gold">
                        <Pencil size={15} />
                      </Link>
                      <button aria-label="Feature" onClick={() => toggleFeatured(p)} disabled={pending} className="hover:text-gold">
                        <Star size={15} className={p.featured ? "fill-gold text-gold" : ""} />
                      </button>
                      <button aria-label="Duplicate" onClick={() => duplicate(p.id)} disabled={pending} className="hover:text-gold">
                        <Copy size={15} />
                      </button>
                      <button aria-label="Toggle visibility" onClick={() => toggleHidden(p)} disabled={pending} className="hover:text-gold">
                        {p.status === "HIDDEN" ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button aria-label="Delete" onClick={() => remove(p.id, p.name)} disabled={pending} className="hover:text-garnet">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
