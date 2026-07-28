"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader, { type UploadedImage } from "@/components/admin/ImageUploader";

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  salePrice: string;
  sku: string;
  material: string;
  status: "DRAFT" | "ACTIVE" | "HIDDEN" | "ARCHIVED" | "SOLD_OUT";
  featured: boolean;
  initialStock: string;
  images: UploadedImage[];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function ProductForm({ initial }: { initial?: Partial<ProductFormValues> }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [values, setValues] = useState<ProductFormValues>({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? "",
    salePrice: initial?.salePrice ?? "",
    sku: initial?.sku ?? "",
    material: initial?.material ?? "",
    status: initial?.status ?? "DRAFT",
    featured: initial?.featured ?? false,
    initialStock: initial?.initialStock ?? "0",
    images: initial?.images ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: values.name,
      slug: values.slug || slugify(values.name),
      description: values.description,
      price: Number(values.price),
      salePrice: values.salePrice ? Number(values.salePrice) : null,
      sku: values.sku,
      material: values.material || null,
      status: values.status,
      featured: values.featured,
      images: values.images.map((i) => ({ url: i.url, altText: i.altText })),
      initialStock: Number(values.initialStock) || 0,
    };

    try {
      const res = await fetch(isEdit ? `/api/products/${initial!.id}` : "/api/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Save failed");
      }
      router.push("/admin/dashboard/productos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="text-xs text-ivory/50 mb-1.5 block">Product Name</label>
        <input
          required
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-ivory/50 mb-1.5 block">URL Slug</label>
          <input
            value={values.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder={slugify(values.name) || "auto-generated"}
            className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory font-mono outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <div>
          <label className="text-xs text-ivory/50 mb-1.5 block">SKU</label>
          <input
            required
            value={values.sku}
            onChange={(e) => update("sku", e.target.value)}
            className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory font-mono outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-ivory/50 mb-1.5 block">Description</label>
        <textarea
          rows={4}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-ivory/50 mb-1.5 block">Price (USD)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
            className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory font-mono outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <div>
          <label className="text-xs text-ivory/50 mb-1.5 block">Sale Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={values.salePrice}
            onChange={(e) => update("salePrice", e.target.value)}
            className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory font-mono outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <div>
          <label className="text-xs text-ivory/50 mb-1.5 block">Stock</label>
          <input
            type="number"
            min="0"
            value={values.initialStock}
            onChange={(e) => update("initialStock", e.target.value)}
            className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory font-mono outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-ivory/50 mb-1.5 block">Material</label>
          <input
            value={values.material}
            onChange={(e) => update("material", e.target.value)}
            placeholder="18k Gold, Sterling Silver…"
            className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <div>
          <label className="text-xs text-ivory/50 mb-1.5 block">Status</label>
          <select
            value={values.status}
            onChange={(e) => update("status", e.target.value as ProductFormValues["status"])}
            className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="HIDDEN">Hidden</option>
            <option value="SOLD_OUT">Sold Out</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ivory/70">
        <input
          type="checkbox"
          checked={values.featured}
          onChange={(e) => update("featured", e.target.checked)}
          className="accent-gold"
        />
        Feature on homepage
      </label>

      <div>
        <label className="text-xs text-ivory/50 mb-1.5 block">Images & Videos</label>
        <ImageUploader
          images={values.images}
          onChange={(images) => update("images", images)}
          productId={initial?.id}
        />
      </div>

      {error && <p className="text-sm text-garnet">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-gold text-onyx px-6 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
