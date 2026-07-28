"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  minPurchase: number | null;
  vipOnly: boolean;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
}

export default function CouponsManager({ initial }: { initial: Coupon[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initial);
  const [form, setForm] = useState({ code: "", type: "PERCENTAGE" as Coupon["type"], value: "10", minPurchase: "", usageLimit: "", vipOnly: false, expiresAt: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minPurchase: form.minPurchase ? Number(form.minPurchase) : null,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          vipOnly: form.vipOnly,
          expiresAt: form.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create coupon");
      setCoupons((c) => [...c, data.coupon]);
      setForm({ code: "", type: "PERCENTAGE", value: "10", minPurchase: "", usageLimit: "", vipOnly: false, expiresAt: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setCoupons((c) => c.map((coupon) => (coupon.id === id ? { ...coupon, active: !active } : coupon)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    setCoupons((c) => c.filter((coupon) => coupon.id !== id));
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="rounded-lg border border-white/10 p-5 grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs text-ivory/50 mb-1.5 block">Code</label>
          <input
            required
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-ivory font-mono outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <div>
          <label className="text-xs text-ivory/50 mb-1.5 block">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Coupon["type"] }))}
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed Amount</option>
            <option value="FREE_SHIPPING">Free Shipping</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-ivory/50 mb-1.5 block">Value</label>
          <input
            type="number"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-ivory font-mono outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-1 rounded-md bg-gold text-onyx px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          <Plus size={14} /> Add
        </button>
      </form>

      {error && <p className="text-sm text-garnet">{error}</p>}

      {coupons.length === 0 ? (
        <div className="rounded-xl border border-white/10 py-16 text-center text-ivory/40 text-sm">
          No coupons yet.
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-ivory/40 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-normal">Code</th>
                <th className="text-left px-4 py-3 font-normal">Type</th>
                <th className="text-left px-4 py-3 font-normal">Value</th>
                <th className="text-left px-4 py-3 font-normal">Used</th>
                <th className="text-left px-4 py-3 font-normal">Status</th>
                <th className="text-right px-4 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-mono text-gold">{c.code}</td>
                  <td className="px-4 py-3 text-ivory/60">{c.type.replace("_", " ")}</td>
                  <td className="px-4 py-3 font-mono text-ivory/90">
                    {c.type === "PERCENTAGE" ? `${c.value}%` : `$${c.value}`}
                  </td>
                  <td className="px-4 py-3 text-ivory/50">{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(c.id, c.active)} className={`text-xs px-2 py-1 rounded-full ${c.active ? "bg-success/10 text-success" : "bg-white/10 text-ivory/40"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(c.id)} className="text-ivory/40 hover:text-garnet">
                      <Trash2 size={15} />
                    </button>
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
