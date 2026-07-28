"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

interface Address {
  id: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ line1: "", line2: "", city: "", state: "", zip: "", country: "México" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/addresses");
    const data = await res.json();
    setAddresses(data.addresses ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addAddress(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "No se pudo guardar la dirección");
      }
      setForm({ line1: "", line2: "", city: "", state: "", zip: "", country: "México" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-8">
      {loading ? (
        <p className="text-ivory/40 text-sm">Cargando…</p>
      ) : addresses.length === 0 ? (
        <p className="text-ivory/40 text-sm">Aún no tienes direcciones guardadas.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-lg border border-white/10 p-4 flex items-start justify-between">
              <div className="text-sm text-ivory/70">
                <p>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                <p>{a.city}, {a.state} {a.zip}</p>
                <p>{a.country}</p>
              </div>
              <button onClick={() => remove(a.id)} className="text-ivory/30 hover:text-garnet">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addAddress} className="rounded-lg border border-white/10 p-5 space-y-3">
        <p className="eyebrow mb-1">Agregar Dirección</p>
        <input
          required
          placeholder="Dirección línea 1"
          value={form.line1}
          onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
          className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
        />
        <input
          placeholder="Línea 2 (opcional)"
          value={form.line2}
          onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
          className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
        />
        <div className="grid grid-cols-3 gap-3">
          <input
            required
            placeholder="Ciudad"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
          />
          <input
            required
            placeholder="Estado"
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            className="rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
          />
          <input
            required
            placeholder="Código Postal"
            value={form.zip}
            onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
            className="rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        {error && <p className="text-xs text-garnet">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-gold text-onyx px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar Dirección"}
        </button>
      </form>
    </div>
  );
}
