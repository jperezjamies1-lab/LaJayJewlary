"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface LiveEvent {
  id: string;
  title: string;
  scheduledAt: string;
  depositAmount: number;
  rules: string | null;
}

export default function LiveEventsManager({ initial }: { initial: LiveEvent[] }) {
  const router = useRouter();
  const [events, setEvents] = useState(initial);
  const [form, setForm] = useState({ title: "", scheduledAt: "", depositAmount: "50", rules: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/live-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          depositAmount: Number(form.depositAmount),
          rules: form.rules || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not schedule event");
      setEvents((ev) => [data.event, ...ev]);
      setForm({ title: "", scheduledAt: "", depositAmount: "50", rules: "" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={create} className="rounded-lg border border-white/10 p-5 space-y-3">
        <p className="eyebrow mb-1">Schedule Live Event</p>
        <input
          required
          placeholder="Event title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
            className="rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
          />
          <input
            required
            type="number"
            placeholder="Deposit amount"
            value={form.depositAmount}
            onChange={(e) => setForm((f) => ({ ...f, depositAmount: e.target.value }))}
            className="rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory font-mono outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <textarea
          placeholder="Rules (optional)"
          rows={2}
          value={form.rules}
          onChange={(e) => setForm((f) => ({ ...f, rules: e.target.value }))}
          className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
        />
        {error && <p className="text-xs text-garnet">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-gold text-onyx px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          <Plus size={15} /> {saving ? "Scheduling…" : "Schedule Event"}
        </button>
      </form>

      {events.length === 0 ? (
        <div className="rounded-xl border border-white/10 py-12 text-center text-ivory/40 text-sm">
          No live events scheduled yet.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="rounded-lg border border-white/10 p-4">
              <p className="text-ivory/90 text-sm">{e.title}</p>
              <p className="text-ivory/40 text-xs mt-1">
                {new Date(e.scheduledAt).toLocaleString()} · Deposit ${e.depositAmount}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
